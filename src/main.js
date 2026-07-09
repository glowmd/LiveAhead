/**
 * LiveAhead — Main Entry Point
 * 
 * Registers all screens, applies the saved theme, and routes
 * to either the welcome screen or the home screen based on
 * whether onboarding is complete.
 */

import './index.css';
import { registerScreen, navigateTo } from './router.js';
import { store, applyTheme } from './store.js';
import { renderWelcome } from './screens/welcome.js';
import { renderGoalSelection } from './screens/goal-selection.js';
import { renderRoutineBuilder } from './screens/routine-builder.js';
import { renderHome } from './screens/home.js';
import { renderWeeklySummary } from './screens/weekly-summary.js';
import { renderSettings } from './screens/settings.js';
import { bindNavEvents } from './screens/nav.js';

// --- Register all screens ---
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
      // Nav events are bound inside settings.js already
    }
  };
});

// --- Initialize ---
function init() {
  // Apply saved theme
  const state = store.getState();
  applyTheme(state.settings.darkMode);

  // Route based on onboarding state
  if (state.onboardingComplete && state.activeHabits.length > 0) {
    navigateTo('home');
  } else {
    navigateTo('welcome');
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
