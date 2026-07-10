/**
 * LiveAhead — Main Entry Point
 *
 * Auth is driven entirely by supabase.auth.onAuthStateChange.
 * This means session restores on page refresh work automatically.
 *
 * Routing logic:
 *   SIGNED_IN  → load data → new user → onboarding; returning → home
 *   SIGNED_OUT → login screen
 *   Magic-link redirect → Supabase detects the token, fires SIGNED_IN
 */

import './index.css';
import { registerScreen, navigateTo, clearHistory } from './router.js';
import { store, applyTheme } from './store.js';
import { supabase } from './lib/supabase.js';
import { updateProfile } from './lib/api/profiles.js';

import { renderLogin } from './screens/login.js';
import { renderWelcome } from './screens/welcome.js';
import { renderGoalSelection } from './screens/goal-selection.js';
import { renderRoutineBuilder } from './screens/routine-builder.js';
import { renderHome } from './screens/home.js';
import { renderWeeklySummary } from './screens/weekly-summary.js';
import { renderSettings } from './screens/settings.js';
import { bindNavEvents } from './screens/nav.js';

// --- Register all screens ---
registerScreen('login', renderLogin);
registerScreen('welcome', renderWelcome);
registerScreen('goal-selection', renderGoalSelection);
registerScreen('routine-builder', renderRoutineBuilder);
registerScreen('home', (options) => {
  const result = renderHome(options);
  return {
    ...result,
    onMount() { result.onMount?.(); bindNavEvents(); }
  };
});
registerScreen('weekly-summary', (options) => {
  const result = renderWeeklySummary(options);
  return {
    ...result,
    onMount() { result.onMount?.(); bindNavEvents(); }
  };
});
registerScreen('settings', (options) => {
  const result = renderSettings(options);
  return { ...result, onMount() { result.onMount?.(); } };
});

// --- Auth state machine ---
let initialized = false;

supabase.auth.onAuthStateChange(async (event, session) => {
  // Apply saved theme on first load
  const savedDarkMode = localStorage.getItem('liveahead_dark_mode') || 'auto';
  applyTheme(savedDarkMode);

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
    if (!session) {
      // INITIAL_SESSION with no session = not logged in
      navigateTo('login');
      return;
    }

    // Show a loading state while we hydrate
    if (!initialized) {
      showLoadingScreen();
    }

    // Ensure profile row exists (trigger may not have run yet for new users)
    await supabase
      .from('profiles')
      .upsert({ id: session.user.id, display_name: session.user.user_metadata?.display_name || '' }, { onConflict: 'id', ignoreDuplicates: true });

    // Hydrate in-memory state from Supabase
    await store.loadFromSupabase(session);

    // Save the display_name from the magic-link form (first sign-in only)
    const pendingName = sessionStorage.getItem('liveahead_pending_name');
    if (pendingName) {
      await store.setDisplayName(pendingName);
      sessionStorage.removeItem('liveahead_pending_name');
    }

    // One-time migration from localStorage (safe to run every sign-in — it's idempotent)
    await store.migrateFromLocalStorage(session.user.id);

    clearHistory();
    initialized = true;

    // Route: new user (no onboarding) → welcome; returning → home
    const state = store.getState();
    if (state.onboardingComplete && state.activeHabits.length > 0) {
      navigateTo('home');
    } else {
      navigateTo('welcome');
    }

  } else if (event === 'SIGNED_OUT') {
    store.clearLocalState();
    clearHistory();
    initialized = false;
    navigateTo('login');
  }
});

// --- Init: apply theme immediately; INITIAL_SESSION handles routing ---
function init() {
  const savedDarkMode = localStorage.getItem('liveahead_dark_mode') || 'auto';
  applyTheme(savedDarkMode);
  // onAuthStateChange fires INITIAL_SESSION on load for both authed and non-authed states
}

function showLoadingScreen() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100dvh;
        gap: 16px;
      ">
        <div style="
          width: 56px; height: 56px;
          background: linear-gradient(145deg, var(--color-accent), var(--color-accent-hover));
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          animation: logoFloat 2s ease-in-out infinite;
        ">🌿</div>
        <p style="color: var(--color-text-tertiary); font-size: 0.875rem;">Loading your routine\u2026</p>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
