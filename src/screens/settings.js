/**
 * Settings Screen
 * 
 * Minimal settings: edit routine, edit goals, dark mode toggle,
 * community placeholder, about/disclaimer, and reset.
 * 
 * Design rationale: Settings are rarely visited. They're clean and
 * grouped logically. The disclaimer is always visible per spec.
 * "Community — coming soon" is the extension point for Discord.
 * Reset has a confirmation dialog to prevent accidents.
 */

import { navigateTo } from '../router.js';
import { store } from '../store.js';
import { renderBottomNav, bindNavEvents } from './nav.js';

export function renderSettings() {
  const state = store.getState();
  const darkMode = state.settings.darkMode;

  const darkModeLabel = darkMode === 'auto' ? 'Auto' : darkMode === 'dark' ? 'On' : 'Off';

  const html = `
    <div class="screen" role="region" aria-label="Settings">
      <div class="section-header mb-6">
        <h1 class="section-header__title">Settings</h1>
      </div>

      <div class="settings-group">
        <h2 class="settings-group__title">Your Routine</h2>
        <div class="settings-item" id="settings-edit-routine" role="button" tabindex="0" aria-label="Edit my routine">
          <span class="settings-item__label">Edit my habits</span>
          <span class="settings-item__arrow" aria-hidden="true">→</span>
        </div>
        <div class="settings-item" id="settings-edit-goals" role="button" tabindex="0" aria-label="Edit my goals">
          <span class="settings-item__label">Edit my goals</span>
          <span class="settings-item__arrow" aria-hidden="true">→</span>
        </div>
      </div>

      <div class="settings-group">
        <h2 class="settings-group__title">Appearance</h2>
        <div class="settings-item" id="settings-dark-mode" role="button" tabindex="0" aria-label="Toggle dark mode, currently ${darkModeLabel}">
          <span class="settings-item__label">Dark mode</span>
          <span class="settings-item__value" id="dark-mode-label">${darkModeLabel}</span>
        </div>
      </div>

      <div class="settings-group">
        <h2 class="settings-group__title">Community</h2>
        <div class="settings-item" style="cursor: default; opacity: 0.6;" aria-label="Community feature coming soon">
          <span class="settings-item__label">Community — coming soon</span>
          <span class="settings-item__value">✨</span>
        </div>
      </div>

      <div class="settings-group">
        <h2 class="settings-group__title">About</h2>
        <div class="settings-item" style="cursor: default;">
          <span class="settings-item__label">LiveAhead v1.0</span>
        </div>
      </div>

      <div class="disclaimer">
        LiveAhead offers general wellness information, not medical advice. The habits and information in this app are based on published research but are not a substitute for professional medical guidance. Please consult your doctor about personal health decisions.
      </div>

      <div class="settings-group mt-8">
        <div class="settings-item settings-item--danger" id="settings-reset" role="button" tabindex="0" aria-label="Reset all data">
          <span class="settings-item__label">Reset all data</span>
          <span class="settings-item__arrow" aria-hidden="true">→</span>
        </div>
      </div>

      <div id="reset-dialog-container"></div>
    </div>
  `;

  return {
    html,
    nav: renderBottomNav('settings'),
    onMount() {
      bindNavEvents();

      // Edit routine
      document.getElementById('settings-edit-routine')?.addEventListener('click', () => {
        navigateTo('routine-builder');
      });

      // Edit goals
      document.getElementById('settings-edit-goals')?.addEventListener('click', () => {
        navigateTo('goal-selection');
      });

      // Dark mode cycle: auto → dark → light → auto
      document.getElementById('settings-dark-mode')?.addEventListener('click', () => {
        const current = store.getState().settings.darkMode;
        const next = current === 'auto' ? 'dark' : current === 'dark' ? 'light' : 'auto';
        store.setDarkMode(next);
        const label = next === 'auto' ? 'Auto' : next === 'dark' ? 'On' : 'Off';
        document.getElementById('dark-mode-label').textContent = label;
      });

      // Reset
      document.getElementById('settings-reset')?.addEventListener('click', () => {
        showResetDialog();
      });
    }
  };
}

function showResetDialog() {
  const container = document.getElementById('reset-dialog-container');
  if (!container) return;

  container.innerHTML = `
    <div class="dialog-overlay" id="reset-overlay" role="dialog" aria-modal="true" aria-label="Confirm reset">
      <div class="dialog">
        <h3 class="dialog__title">Start fresh?</h3>
        <p class="dialog__body">This will remove all your goals, habits, and progress. This can't be undone — but a fresh start can be a good thing.</p>
        <div class="dialog__actions">
          <button class="btn btn--secondary" id="reset-cancel">Keep my data</button>
          <button class="btn btn--primary" id="reset-confirm" style="background: var(--color-heart);">Start fresh</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('reset-cancel')?.addEventListener('click', () => {
    container.innerHTML = '';
  });

  document.getElementById('reset-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'reset-overlay') {
      container.innerHTML = '';
    }
  });

  document.getElementById('reset-confirm')?.addEventListener('click', () => {
    store.resetAll();
    navigateTo('welcome');
  });
}
