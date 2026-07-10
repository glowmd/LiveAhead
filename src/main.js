/**
 * LiveAhead — Main Entry Point
 *
 * Auth is now simple: check localStorage for a cached user.
 * - Cached user found → load their data from Supabase → route to home/onboarding
 * - No cached user → show login screen
 *
 * No Supabase Auth sessions, no onAuthStateChange.
 */

import './index.css';
import { registerScreen, navigateTo, clearHistory } from './router.js';
import { store, applyTheme } from './store.js';

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
  return { ...result, onMount() { result.onMount?.(); bindNavEvents(); } };
});
registerScreen('weekly-summary', (options) => {
  const result = renderWeeklySummary(options);
  return { ...result, onMount() { result.onMount?.(); bindNavEvents(); } };
});
registerScreen('settings', (options) => {
  const result = renderSettings(options);
  return { ...result, onMount() { result.onMount?.(); } };
});

// --- App init ---
async function init() {
  // Apply saved theme immediately (before any async work)
  const savedDarkMode = localStorage.getItem('liveahead_dark_mode') || 'auto';
  applyTheme(savedDarkMode);

  // Check for a cached user in localStorage
  const hasCachedUser = store.initFromLocalStorage();

  if (!hasCachedUser) {
    navigateTo('login');
    return;
  }

  // Show loading while fetching Supabase data
  showLoadingScreen();

  // Load their data from Supabase
  const user = store.getUser();
  await store.loadForUser({ id: user.id, email: user.email, display_name: user.name });

  clearHistory();

  const state = store.getState();
  if (state.onboardingComplete && state.activeHabits.length > 0) {
    navigateTo('home');
  } else {
    navigateTo('welcome');
  }
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
