/**
 * LiveAhead — State Management
 * 
 * All user data persists in localStorage.
 * Provides reactive helpers for goals, habits, daily logs, and streaks.
 */

const STORAGE_KEY = 'liveahead_data';

const DEFAULT_STATE = {
  onboardingComplete: false,
  goals: [],           // ['brain', 'stress', 'heart']
  activeHabits: [],    // habit IDs: ['sleep-well', 'move-daily', ...]
  logs: {},            // { '2026-07-09': ['sleep-well', 'move-daily'] }
  settings: {
    darkMode: 'auto',  // 'auto' | 'light' | 'dark'
    notificationsAsked: false,
    notificationsEnabled: false
  },
  firstCheckOffDone: false
};

let state = loadState();
const listeners = new Set();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...parsed.settings } };
    }
  } catch (e) {
    console.warn('LiveAhead: Could not load saved data, starting fresh.', e);
  }
  return { ...DEFAULT_STATE };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('LiveAhead: Could not save data.', e);
  }
}

function notify() {
  listeners.forEach(fn => fn(state));
}

// --- Public API ---

export const store = {
  getState() {
    return state;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // --- Onboarding ---
  setGoals(goalIds) {
    state.goals = [...goalIds];
    saveState();
    notify();
  },

  setActiveHabits(habitIds) {
    state.activeHabits = [...habitIds];
    saveState();
    notify();
  },

  completeOnboarding() {
    state.onboardingComplete = true;
    saveState();
    notify();
  },

  // --- Daily Logging ---
  toggleHabit(dateStr, habitId) {
    if (!state.logs[dateStr]) {
      state.logs[dateStr] = [];
    }
    const idx = state.logs[dateStr].indexOf(habitId);
    if (idx === -1) {
      state.logs[dateStr].push(habitId);
    } else {
      state.logs[dateStr].splice(idx, 1);
    }

    // Track first check-off for notification prompt
    if (!state.firstCheckOffDone && state.logs[dateStr].length > 0) {
      state.firstCheckOffDone = true;
    }

    saveState();
    notify();
  },

  isHabitDone(dateStr, habitId) {
    return (state.logs[dateStr] || []).includes(habitId);
  },

  getDayProgress(dateStr) {
    const done = (state.logs[dateStr] || []).length;
    const total = state.activeHabits.length;
    return { done, total };
  },

  // --- Streaks ---
  getStreak(habitId) {
    const today = getTodayStr();
    let streak = 0;
    let date = new Date(today + 'T12:00:00');

    // Check if today is done; if not, start from yesterday
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

    // Check if today is fully done
    const todayProgress = store.getDayProgress(today);
    if (todayProgress.done < total) {
      date.setDate(date.getDate() - 1);
    }

    while (true) {
      const dateStr = formatDateStr(date);
      const dayDone = (state.logs[dateStr] || []).length;
      // Count day as streak if at least one habit was done
      if (dayDone > 0) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  // --- Weekly Data ---
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
    const day = today.getDay(); // 0=Sun
    const diff = day === 0 ? 6 : day - 1; // Monday start
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

    // Best habit
    const best = habitStats.length > 0
      ? habitStats.reduce((a, b) => a.daysCompleted >= b.daysCompleted ? a : b)
      : null;
    // Weakest habit (only if there's room to improve)
    const weakest = habitStats.length > 0
      ? habitStats.reduce((a, b) => a.daysCompleted <= b.daysCompleted ? a : b)
      : null;

    return {
      weekData,
      habitStats,
      totalCompleted,
      totalPossible,
      completionRate,
      bestHabit: best,
      weakestHabit: weakest
    };
  },

  // --- Settings ---
  setDarkMode(mode) {
    state.settings.darkMode = mode;
    applyTheme(mode);
    saveState();
    notify();
  },

  markNotificationsAsked() {
    state.settings.notificationsAsked = true;
    saveState();
  },

  setNotificationsEnabled(enabled) {
    state.settings.notificationsEnabled = enabled;
    saveState();
    notify();
  },

  shouldAskNotifications() {
    return state.firstCheckOffDone && !state.settings.notificationsAsked;
  },

  // --- Reset ---
  resetAll() {
    state = { ...DEFAULT_STATE };
    saveState();
    notify();
  }
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
    weekday: 'long',
    month: 'long',
    day: 'numeric'
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
  if (mode === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (mode === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
}
