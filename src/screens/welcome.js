/**
 * Welcome Screen
 * 
 * Tagline, single "Get started" button. Back button to login.
 * Zero decisions — maximum warmth.
 */

import { navigateTo, goBack, canGoBack } from '../router.js';

export function renderWelcome() {
  const backBtn = canGoBack()
    ? `<button class="back-btn" id="back-btn" aria-label="Go back"><span class="back-btn__arrow" aria-hidden="true">←</span></button>`
    : '';

  const html = `
    <div class="welcome screen--no-nav" role="region" aria-label="Welcome to LiveAhead">
      ${backBtn}
      <div class="welcome__logo" aria-hidden="true">
        <span class="welcome__logo-icon">🌿</span>
      </div>
      <h1 class="welcome__title">LiveAhead</h1>
      <p class="welcome__tagline">
        For everyone who wants more healthy years with the people they love, LiveAhead makes preventive health simple, personal, and achievable — one small step at a time.
      </p>
      <p class="welcome__subtitle">
        Pick a goal. Build a small daily routine. We'll handle the remembering.
      </p>
      <button id="welcome-start-btn" class="btn btn--primary" aria-label="Get started with LiveAhead">
        Get started
      </button>
    </div>
  `;

  return {
    html,
    nav: null,
    onMount() {
      document.getElementById('welcome-start-btn').addEventListener('click', () => {
        navigateTo('goal-selection');
      });
      document.getElementById('back-btn')?.addEventListener('click', goBack);
    }
  };
}
