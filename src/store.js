/**
 * LiveAhead — State Management (Supabase-backed)
 *
 * Single source of truth. In-memory state is loaded from Supabase
 * on session start and written back on every change.
 * localStorage is only used for dark-mode preference (non-sensitive UI pref).
 *
 * Architecture:
 *   - supabase.auth.onAuthStateChange drives routing in main.js
 *   - store.loadFromSupabase() hydrates in-memory state after sign-in
 *   - All writes go to Supabase immediately; in-memory mirrors for fast reads
 */

import { supabase } from './lib/supabase.js';
import { getAllLogs, logHabit, unlogHabit, bulkInsertLogs } from './lib/api/logs.js';
import { getUserSettings, upsertUserSettings } from './lib/api/user-settings.js';
import { updateProfile } from './lib/api/profiles.js';

const LEGACY_STORAGE_KEY = 'liveahead_data';
const DARK_MODE_KEY = 'liveahead_dark_mode';

// In-memory state — populated from Supabase after login
let state = {
  // Auth
  session: null,          // Supabase session object
  user: null,             // { id, name, email }

  // Settings (from user_settings table)
  onboardingComplete: false,
  goals: [],
  activeHabits: [],
  shareDismissed: false,

  // Logs (from habit_logs table) — keyed by date: { 'YYYY-MM-DD': ['habitId'] }
  logs: {},

  // UI only — kept in localStorage
  settings: {
    darkMode: localStorage.getItem(DARK_MODE_KEY) || 'auto',
    notificationsAsked: false,
    notificationsEnabled: false,
  },
  firstCheckOffDone: false,
};

const listeners = new Set();

function notify() {
  listeners.forEach(fn => fn(state));
}

// --- Public Store API ---

export const store = {
  getState() {
    return state;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // -------------------------------------------------------
  // Auth helpers (thin wrappers — real auth is in lib/api/auth.js)
  // -------------------------------------------------------
  getUser() {
    return state.user;
  },

  isLoggedIn() {
    return state.session !== null && state.user !== null;
  },

  getSession() {
    return state.session;
  },

  // Called by main.js onAuthStateChange
  setSession(session) {
    state.session = session;
  },

  // -------------------------------------------------------
  // Load all data from Supabase after sign-in
  // -------------------------------------------------------
  async loadFromSupabase(session) {
    if (!session) return;
    state.session = session;
    const userId = session.user.id;

    // Load profile — use maybeSingle() so a missing row (new user, trigger race)
    // returns null instead of throwing a PGRST116 error
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', userId)
      .maybeSingle();

    state.user = {
      id: userId,
      name: profile?.display_name || session.user.email?.split('@')[0] || '',
      email: session.user.email || '',
    };

    // Load settings
    const { data: settings } = await getUserSettings(userId);
    if (settings) {
      state.goals = settings.goals || [];
      state.activeHabits = settings.active_habits || [];
      state.onboardingComplete = settings.onboarding_complete || false;
      state.shareDismissed = settings.share_dismissed || false;
      if (settings.dark_mode) {
        state.settings.darkMode = settings.dark_mode;
        localStorage.setItem(DARK_MODE_KEY, settings.dark_mode);
      }
    }

    // Load logs
    const { data: logs } = await getAllLogs(userId);
    state.logs = logs || {};

    notify();
  },

  // -------------------------------------------------------
  // One-time localStorage → Supabase migration
  // -------------------------------------------------------
  async migrateFromLocalStorage(userId) {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return; // nothing to migrate

    let legacy;
    try { legacy = JSON.parse(raw); } catch { return; }

    // Only migrate if there's real data
    const hasData = (
      (legacy.goals?.length > 0) ||
      (legacy.activeHabits?.length > 0) ||
      (Object.keys(legacy.logs || {}).length > 0)
    );
    if (!hasData) { localStorage.removeItem(LEGACY_STORAGE_KEY); return; }

    console.log('LiveAhead: Migrating localStorage data to Supabase...');

    // Migrate settings (only if user hasn't set anything in Supabase yet)
    const { data: existingSettings } = await getUserSettings(userId);
    if (!existingSettings || (!existingSettings.onboarding_complete && !(existingSettings.goals?.length))) {
      await upsertUserSettings(userId, {
        goals: legacy.goals || [],
        active_habits: legacy.activeHabits || [],
        onboarding_complete: legacy.onboardingComplete || false,
        share_dismissed: legacy.shareDismissed || false,
        dark_mode: legacy.settings?.darkMode || 'auto',
      });
    }

    // Migrate logs
    if (Object.keys(legacy.logs || {}).length > 0) {
      await bulkInsertLogs(userId, legacy.logs);
    }

    // Clear localStorage only after successful migration
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    console.log('LiveAhead: Migration complete.');
  },

  // -------------------------------------------------------
  // Reset in-memory state on sign-out (do NOT delete Supabase data)
  // -------------------------------------------------------
  clearLocalState() {
    state.session = null;
    state.user = null;
    state.onboardingComplete = false;
    state.goals = [];
    state.activeHabits = [];
    state.shareDismissed = false;
    state.logs = {};
    state.firstCheckOffDone = false;
    notify();
  },

  // -------------------------------------------------------
  // Referral
  // -------------------------------------------------------
  getDaysOfUse() {
    return Object.keys(state.logs).filter(d => state.logs[d].length > 0).length;
  },

  shouldShowSharePrompt() {
    return store.getDaysOfUse() >= 3 && !state.shareDismissed;
  },

  async dismissSharePrompt() {
    state.shareDismissed = true;
    notify();
    if (state.user?.id) {
      await upsertUserSettings(state.user.id, { share_dismissed: true });
    }
  },

  // -------------------------------------------------------
  // Goals & Habits
  // -------------------------------------------------------
  async setGoals(goalIds) {
    state.goals = [...goalIds];
    notify();
    if (state.user?.id) {
      await upsertUserSettings(state.user.id, { goals: state.goals });
    }
  },

  async setActiveHabits(habitIds) {
    state.activeHabits = [...habitIds];
    notify();
    if (state.user?.id) {
      await upsertUserSettings(state.user.id, { active_habits: state.activeHabits });
    }
  },

  async completeOnboarding() {
    state.onboardingComplete = true;
    notify();
    if (state.user?.id) {
      await upsertUserSettings(state.user.id, { onboarding_complete: true });
    }
  },

  // -------------------------------------------------------
  // Daily Logging
  // -------------------------------------------------------
  async toggleHabit(dateStr, habitId) {
    if (!state.logs[dateStr]) state.logs[dateStr] = [];

    const isDone = state.logs[dateStr].includes(habitId);
    const userId = state.user?.id;

    if (isDone) {
      // Optimistic remove
      state.logs[dateStr] = state.logs[dateStr].filter(id => id !== habitId);
      notify();
      if (userId) await unlogHabit(userId, habitId, dateStr);
    } else {
      // Optimistic add
      state.logs[dateStr].push(habitId);
      if (!state.firstCheckOffDone) state.firstCheckOffDone = true;
      notify();
      if (userId) await logHabit(userId, habitId, dateStr);
    }
  },

  isHabitDone(dateStr, habitId) {
    return (state.logs[dateStr] || []).includes(habitId);
  },

  getDayProgress(dateStr) {
    const done = (state.logs[dateStr] || []).length;
    const total = state.activeHabits.length;
    return { done, total };
  },

  // -------------------------------------------------------
  // Streaks
  // -------------------------------------------------------
  getStreak(habitId) {
    const today = getTodayStr();
    let streak = 0;
    let date = new Date(today + 'T12:00:00');

    if (!store.isHabitDone(today, habitId)) {
      date.setDate(date.getDate() - 1);
    }

    while (true) {
      const dateStr = formatDateStr(date);
      if (store.isHabitDone(dateStr, habitId)) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  getOverallStreak() {
    const today = getTodayStr();
    let streak = 0;
    let date = new Date(today + 'T12:00:00');
    const total = state.activeHabits.length;

    if (total === 0) return 0;

    const todayProgress = store.getDayProgress(today);
    if (todayProgress.done < total) {
      date.setDate(date.getDate() - 1);
    }

    while (true) {
      const dateStr = formatDateStr(date);
      const dayDone = (state.logs[dateStr] || []).length;
      if (dayDone > 0) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  // -------------------------------------------------------
  // Weekly Stats
  // -------------------------------------------------------
  getWeekData(weekStartDate) {
    const days = [];
    const date = new Date(weekStartDate);
    for (let i = 0; i < 7; i++) {
      const dateStr = formatDateStr(date);
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        completedHabits: state.logs[dateStr] || []
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  },

  getCurrentWeekStart() {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  },

  getWeekStats() {
    const weekStart = store.getCurrentWeekStart();
    const weekData = store.getWeekData(weekStart);
    const habits = state.activeHabits;

    const habitStats = habits.map(habitId => {
      const daysCompleted = weekData.filter(d => d.completedHabits.includes(habitId)).length;
      return { habitId, daysCompleted };
    });

    const totalPossible = habits.length * 7;
    const totalCompleted = habitStats.reduce((sum, h) => sum + h.daysCompleted, 0);
    const completionRate = totalPossible > 0 ? totalCompleted / totalPossible : 0;

    const best = habitStats.length > 0
      ? habitStats.reduce((a, b) => a.daysCompleted >= b.daysCompleted ? a : b)
      : null;
    const weakest = habitStats.length > 0
      ? habitStats.reduce((a, b) => a.daysCompleted <= b.daysCompleted ? a : b)
      : null;

    return { weekData, habitStats, totalCompleted, totalPossible, completionRate, bestHabit: best, weakestHabit: weakest };
  },

  // -------------------------------------------------------
  // Settings (dark mode goes to both localStorage + Supabase)
  // -------------------------------------------------------
  async setDarkMode(mode) {
    state.settings.darkMode = mode;
    localStorage.setItem(DARK_MODE_KEY, mode);
    applyTheme(mode);
    notify();
    if (state.user?.id) {
      await upsertUserSettings(state.user.id, { dark_mode: mode });
    }
  },

  shouldAskNotifications() {
    return state.firstCheckOffDone && !state.settings.notificationsAsked;
  },

  markNotificationsAsked() {
    state.settings.notificationsAsked = true;
  },

  // -------------------------------------------------------
  // Profile
  // -------------------------------------------------------
  async setDisplayName(name) {
    if (state.user) state.user.name = name;
    notify();
    if (state.user?.id) {
      await updateProfile(state.user.id, { display_name: name });
    }
  },

  // -------------------------------------------------------
  // Reset (wipes Supabase data for this user)
  // -------------------------------------------------------
  async resetAll() {
    const userId = state.user?.id;
    if (userId) {
      await supabase.from('habit_logs').delete().eq('user_id', userId);
      await upsertUserSettings(userId, {
        goals: [],
        active_habits: [],
        onboarding_complete: false,
        share_dismissed: false,
      });
    }
    store.clearLocalState();
  },
};

// --- Date Helpers ---

export function getTodayStr() {
  return formatDateStr(new Date());
}

export function formatDateStr(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

export function isToday(dateStr) {
  return dateStr === getTodayStr();
}

export function isFuture(dateStr) {
  return dateStr > getTodayStr();
}

// --- Theme ---

export function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'dark') root.setAttribute('data-theme', 'dark');
  else if (mode === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
}
