/**
 * Login Screen — Magic Link (Passwordless)
 *
 * Name + email form → supabase.auth.signInWithOtp → "Check your email" state.
 * Name is stored locally and saved to the profile after first sign-in.
 * The OTP call is handled here; the redirect back is handled in main.js
 * via onAuthStateChange.
 */

import { supabase } from '../lib/supabase.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function renderLogin() {
  // Store name temporarily — it's saved to the profile after the magic link
  // redirect lands and onAuthStateChange fires.
  const pendingName = sessionStorage.getItem('liveahead_pending_name') || '';

  const html = `
    <div class="login screen--no-nav" role="region" aria-label="Welcome to LiveAhead">
      <div class="login__header">
        <div class="login__logo" aria-hidden="true">
          <span class="login__logo-icon">🌿</span>
        </div>
        <h1 class="login__title">Welcome to LiveAhead</h1>
        <p class="login__subtitle">More healthy years with the people you love — one small step at a time.</p>
      </div>

      <!-- Step 1: Name + Email form -->
      <div id="login-step-form">
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
              value="${pendingName}"
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
              Send magic link
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Check your email (shown after OTP sent) -->
      <div id="login-step-check" style="display:none;" role="status" aria-live="polite">
        <div class="state-message" style="padding-top: var(--space-10);">
          <span class="state-message__icon" aria-hidden="true">📬</span>
          <p style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text); margin-bottom: var(--space-3);">Check your email</p>
          <p style="margin-bottom: var(--space-6);">We sent a sign-in link to <strong id="sent-to-email"></strong>. Tap the link in that email to continue — it's valid for 1 hour.</p>
          <button class="btn btn--secondary" id="resend-btn" style="width: 100%;" aria-label="Resend magic link">
            Resend link
          </button>
          <p id="resend-timer" style="font-size: var(--font-size-sm); color: var(--color-text-tertiary); margin-top: var(--space-3); min-height: 1.5rem;"></p>
          <button class="btn btn--ghost" id="back-to-form-btn" style="width: 100%; margin-top: var(--space-2);" aria-label="Use a different email">
            Use a different email
          </button>
        </div>
      </div>
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
      const submitBtn = document.getElementById('login-submit-btn');
      const stepForm = document.getElementById('login-step-form');
      const stepCheck = document.getElementById('login-step-check');
      const sentToEmail = document.getElementById('sent-to-email');
      const resendBtn = document.getElementById('resend-btn');
      const resendTimer = document.getElementById('resend-timer');
      const backBtn = document.getElementById('back-to-form-btn');

      let resendCooldown = null;

      function startResendCooldown() {
        let seconds = 60;
        resendBtn.disabled = true;
        resendTimer.textContent = `You can resend in ${seconds}s`;

        resendCooldown = setInterval(() => {
          seconds--;
          if (seconds <= 0) {
            clearInterval(resendCooldown);
            resendBtn.disabled = false;
            resendTimer.textContent = '';
          } else {
            resendTimer.textContent = `You can resend in ${seconds}s`;
          }
        }, 1000);
      }

      async function sendMagicLink(email) {
        const redirectTo = window.location.origin + window.location.pathname;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
            data: { display_name: nameInput.value.trim() }
          }
        });
        return error;
      }

      // Inline email validation
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

      emailInput.addEventListener('input', () => {
        emailInput.classList.remove('input--error');
        emailError.textContent = '';
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) { nameInput.focus(); return; }

        if (!email || !isValidEmail(email)) {
          emailInput.classList.add('input--error');
          emailError.textContent = "That email doesn\u2019t look quite right";
          emailInput.focus();
          return;
        }

        // Store name in sessionStorage so it survives the redirect
        sessionStorage.setItem('liveahead_pending_name', name);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending\u2026';

        const error = await sendMagicLink(email);

        if (error) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send magic link';
          emailInput.classList.add('input--error');
          emailError.textContent = 'Something went wrong. Please try again.';
          return;
        }

        // Show the "Check your email" state
        sentToEmail.textContent = email;
        stepForm.style.display = 'none';
        stepCheck.style.display = 'block';
        startResendCooldown();
      });

      resendBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending\u2026';
        await sendMagicLink(email);
        resendBtn.textContent = 'Resend link';
        startResendCooldown();
      });

      backBtn.addEventListener('click', () => {
        if (resendCooldown) clearInterval(resendCooldown);
        stepCheck.style.display = 'none';
        stepForm.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send magic link';
      });
    }
  };
}
