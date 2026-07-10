/**
 * LiveAhead — Main Entry Point
 * 
 * Registers all screens, applies the saved theme, and routes based on:
 * 1. Not logged in → login screen
 * 2. Logged in, no onboarding → welcome screen
 * 3. Logged in, onboarding complete → home screen
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
  return {
    ...result,
    onMount() {
      result.onMount?.();
      bindNavEvents();
    }
  };
});
registerScreen('weekly-summary', (options) => {
  const result = renderWeeklySummary(options);
  return {
    ...result,
    onMount() {
      result.onMount?.();
      bindNavEvents();
    }
  };
});
registerScreen('settings', (options) => {
  const result = renderSettings(options);
  return {
    ...result,
    onMount() {
      result.onMount?.();
    }
  };
});

// --- Initialize ---
function init() {
  const state = store.getState();
  applyTheme(state.settings.darkMode);

  // Clear history on fresh app load
  clearHistory();

  // Route based on auth + onboarding state
  if (!store.isLoggedIn()) {
    navigateTo('login');
  } else if (state.onboardingComplete && state.activeHabits.length > 0) {
    navigateTo('home');
  } else {
    navigateTo('welcome');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
