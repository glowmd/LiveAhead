/**
 * Settings Screen
 * 
 * Account info, edit routine/goals, dark mode, community placeholder,
 * disclaimer, logout, and reset. All with back navigation.
 */

import { navigateTo } from '../router.js';
import { store } from '../store.js';
import { supabase } from '../lib/supabase.js';
import { renderBottomNav, bindNavEvents } from './nav.js';
import { showReferralDialog } from './referral.js';

export function renderSettings() {
  const state = store.getState();
  const darkMode = state.settings.darkMode;
  const user = state.user;

  const darkModeLabel = darkMode === 'auto' ? 'Auto' : darkMode === 'dark' ? 'On' : 'Off';

  const html = `
    <div class="screen" role="region" aria-label="Settings">
      <div class="section-header mb-5">
        <h1 class="section-header__title">Settings</h1>
      </div>

      ${user ? `
      <div class="settings-group">
        <h2 class="settings-group__title">Account</h2>
        <div class="account-info">
          <div class="account-info__name">${user.name}</div>
          <div class="account-info__email">${user.email}</div>
        </div>
        <div class="settings-item" id="settings-logout" role="button" tabindex="0" aria-label="Log out">
          <span class="settings-item__label">Log out</span>
          <span class="settings-item__arrow" aria-hidden="true">→</span>
        </div>
      </div>
      ` : ''}

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
        <div class="settings-item" id="settings-refer" role="button" tabindex="0" aria-label="Refer a friend">
          <span class="settings-item__label">Refer a friend</span>
          <span class="settings-item__value">💌</span>
        </div>
        <div class="settings-item" style="cursor: default; opacity: 0.5;" aria-label="Community feature coming soon">
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

      <div class="settings-group mt-6">
        <div class="settings-item settings-item--danger" id="settings-reset" role="button" tabindex="0" aria-label="Reset all data">
          <span class="settings-item__label">Reset all data</span>
          <span class="settings-item__arrow" aria-hidden="true">→</span>
        </div>
      </div>

      <div id="dialog-container"></div>
    </div>
  `;

  return {
    html,
    nav: renderBottomNav('settings'),
    onMount() {
      bindNavEvents();

      document.getElementById('settings-edit-routine')?.addEventListener('click', () => {
        navigateTo('routine-builder');
      });

      document.getElementById('settings-edit-goals')?.addEventListener('click', () => {
        navigateTo('goal-selection');
      });

      // Refer a friend
      document.getElementById('settings-refer')?.addEventListener('click', () => {
        const container = document.getElementById('dialog-container');
        showReferralDialog(container);
      });

      document.getElementById('settings-dark-mode')?.addEventListener('click', () => {
        const current = store.getState().settings.darkMode;
        const next = current === 'auto' ? 'dark' : current === 'dark' ? 'light' : 'auto';
        store.setDarkMode(next);
        const label = next === 'auto' ? 'Auto' : next === 'dark' ? 'On' : 'Off';
        document.getElementById('dark-mode-label').textContent = label;
      });

      document.getElementById('settings-logout')?.addEventListener('click', () => {
        showDialog(
          'Log out?',
          'Your progress is safely saved. You can sign back in any time with a magic link.',
          'Log out',
          async () => {
            await supabase.auth.signOut();
            // onAuthStateChange SIGNED_OUT in main.js handles routing
          }
        );
      });

      document.getElementById('settings-reset')?.addEventListener('click', () => {
        showDialog(
          'Start fresh?',
          "This will permanently delete all your goals, habits, and progress from LiveAhead. This can\u2019t be undone.",
          'Delete everything',
          async () => {
            await store.resetAll();
            await supabase.auth.signOut();
          },
          true
        );
      });
    }
  };
}

function showDialog(title, body, confirmText, onConfirm, isDanger = false) {
  const container = document.getElementById('dialog-container');
  if (!container) return;

  const confirmStyle = isDanger ? 'style="background: var(--color-heart);"' : '';

  container.innerHTML = `
    <div class="dialog-overlay" id="dialog-overlay" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="dialog">
        <h3 class="dialog__title">${title}</h3>
        <p class="dialog__body">${body}</p>
        <div class="dialog__actions">
          <button class="btn btn--secondary" id="dialog-cancel">Cancel</button>
          <button class="btn btn--primary" id="dialog-confirm" ${confirmStyle}>${confirmText}</button>
        </div>
      </div>
    </div>
  `;

  const close = () => { container.innerHTML = ''; };

  document.getElementById('dialog-cancel')?.addEventListener('click', close);
  document.getElementById('dialog-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'dialog-overlay') close();
  });
  document.getElementById('dialog-confirm')?.addEventListener('click', () => {
    close();
    onConfirm();
  });
}
