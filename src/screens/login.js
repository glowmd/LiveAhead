/**
 * Login Screen — Email-only
 *
 * Name + email → instantly logged in. No verification, no magic link.
 * Same email on any device → your data comes back.
 */

import { signInWithEmail } from '../lib/api/simple-auth.js';
import { store } from '../store.js';
import { navigateTo } from '../router.js';

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
          <span class="input-error-msg" id="name-error" role="alert" aria-live="polite"></span>
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

        <p class="login__privacy">
          Your email is only used to save and restore your progress. We never send marketing emails.
        </p>

        <div class="login__action">
          <button type="submit" class="btn btn--primary" id="login-submit-btn">
            Get started
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
      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const submitBtn = document.getElementById('login-submit-btn');

      // Clear errors on input
      nameInput.addEventListener('input', () => {
        nameInput.classList.remove('input--error');
        nameError.textContent = '';
      });
      emailInput.addEventListener('input', () => {
        emailInput.classList.remove('input--error');
        emailError.textContent = '';
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        // Validate
        let valid = true;
        if (!name) {
          nameInput.classList.add('input--error');
          nameError.textContent = 'Please enter your name';
          nameInput.focus();
          valid = false;
        }
        if (!email || !isValidEmail(email)) {
          emailInput.classList.add('input--error');
          emailError.textContent = "That email doesn\u2019t look quite right";
          if (valid) emailInput.focus();
          valid = false;
        }
        if (!valid) return;

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading\u2026';

        const { data: user, error } = await signInWithEmail(email, name);

        if (error) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Get started';
          emailInput.classList.add('input--error');
          emailError.textContent = error;
          return;
        }

        // Load their data from Supabase then route
        await store.loadForUser(user);

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
