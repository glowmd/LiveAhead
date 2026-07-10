/**
 * Login Screen
 * 
 * Warm welcome with name + email fields. No password.
 * Validates email inline with gentle messaging.
 * Persists user for returning sessions.
 * 
 * Design rationale: This feels like a welcome, not a security checkpoint.
 * The tagline is present, the tone is warm, and there are only two fields.
 * The auth logic is structured so a real provider (OAuth, magic link) can
 * replace the localStorage approach without reworking the screen.
 */

import { navigateTo } from '../router.js';
import { store } from '../store.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function renderLogin() {
  const html = `
    <div class="login screen--no-nav" role="region" aria-label="Welcome to LiveAhead">
      <div class="login__header">
        <div class="login__logo" aria-hidden="true">
          <span class="login__logo-icon">🌿</span>
        </div>
        <h1 class="login__title">Welcome to LiveAhead</h1>
        <p class="login__subtitle">More healthy years with the people you love — one small step at a time.</p>
      </div>

      <form class="login__form" id="login-form" novalidate>
        <div class="input-group">
          <label class="input-label" for="login-name">Your name</label>
          <input 
            class="input" 
            type="text" 
            id="login-name" 
            name="name"
            placeholder="What should we call you?"
            autocomplete="given-name"
            required
          />
        </div>

        <div class="input-group">
          <label class="input-label" for="login-email">Email</label>
          <input 
            class="input" 
            type="email" 
            id="login-email" 
            name="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
          <span class="input-error-msg" id="email-error" role="alert" aria-live="polite"></span>
        </div>

        <div class="login__action">
          <button type="submit" class="btn btn--primary" id="login-submit-btn">
            Continue
          </button>
        </div>
      </form>
    </div>
  `;

  return {
    html,
    nav: null,
    onMount() {
      const form = document.getElementById('login-form');
      const nameInput = document.getElementById('login-name');
      const emailInput = document.getElementById('login-email');
      const emailError = document.getElementById('email-error');

      // Inline email validation on blur
      emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (email && !isValidEmail(email)) {
          emailInput.classList.add('input--error');
          emailError.textContent = "That email doesn\u2019t look quite right";
        } else {
          emailInput.classList.remove('input--error');
          emailError.textContent = '';
        }
      });

      // Clear error on input
      emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('input--error')) {
          emailInput.classList.remove('input--error');
          emailError.textContent = '';
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) {
          nameInput.focus();
          return;
        }

        if (!email || !isValidEmail(email)) {
          emailInput.classList.add('input--error');
          emailError.textContent = "That email doesn\u2019t look quite right";
          emailInput.focus();
          return;
        }

        // Save user and proceed
        store.setUser(name, email);

        const state = store.getState();
        if (state.onboardingComplete && state.activeHabits.length > 0) {
          navigateTo('home');
        } else {
          navigateTo('welcome');
        }
      });
    }
  };
}
