/**
 * Welcome Screen
 * 
 * First screen the user sees. Zero decisions — just a warm greeting,
 * the tagline, and a single "Get started" button.
 * 
 * Design rationale: Reduces mental load to zero. The user sees exactly
 * what LiveAhead does and has one clear action. The floating logo and
 * warm copy set the calm, encouraging tone from the first moment.
 */

import { navigateTo } from '../router.js';

export function renderWelcome() {
  const html = `
    <div class="welcome screen--no-nav" role="region" aria-label="Welcome to LiveAhead">
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
    }
  };
}
