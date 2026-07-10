/**
 * Referral / Share Component
 * 
 * Lets users share LiveAhead with a friend by entering their email.
 * Opens the user's email client via mailto: with a pre-filled
 * referral message in the app's warm, science-backed voice.
 * 
 * Used in two contexts:
 * 1. Settings → "Refer a friend"
 * 2. Auto-prompt on home screen after 3 days of use
 */

import { store } from '../store.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildReferralEmail(senderName, recipientEmail) {
  const subject = `${senderName} thinks you'd love LiveAhead`;

  const body = `Hey!

I've been using an app called LiveAhead and wanted to share it with you.

It's a preventive health app that makes building healthy habits genuinely simple — no complicated tracking, no guilt, just small daily steps backed by real research. I've been using it for ${store.getDaysOfUse()} days and it's been quietly making a difference.

The idea is that healthy years aren't built in big dramatic moments — they come from small, consistent daily choices. LiveAhead helps you pick a few evidence-based habits (things like better sleep, daily movement, eating well) and check them off each day. That's it.

What I like about it:
• It's calm — no gamification, no guilt, no streaks to stress about
• Every habit has real research behind it (you can see the actual studies)
• It takes about 10 seconds a day to use

If you're interested in adding more healthy years with the people you love, give it a try: https://liveahead.app

— ${senderName}`;

  return { subject, body };
}

/**
 * Show the referral dialog. Can be used as a prompt or from settings.
 * @param {HTMLElement} container - Element to render the dialog into
 * @param {Object} options
 * @param {boolean} options.isPrompt - If true, shows as a gentle prompt with dismiss option
 * @param {Function} options.onClose - Callback when dialog closes
 */
export function showReferralDialog(container, options = {}) {
  const { isPrompt = false, onClose } = options;
  const user = store.getUser();
  const senderName = user?.name || 'A friend';

  const promptHeader = isPrompt
    ? `<p class="referral__prompt-text">You've been showing up for ${store.getDaysOfUse()} days — that's worth sharing. Know someone who'd benefit from building healthier habits?</p>`
    : '';

  container.innerHTML = `
    <div class="dialog-overlay" id="referral-overlay" role="dialog" aria-modal="true" aria-label="Refer a friend">
      <div class="dialog" style="max-width: 360px;">
        <h3 class="dialog__title">Share LiveAhead</h3>
        ${promptHeader}
        <p class="dialog__body" style="margin-bottom: var(--space-4);">Enter your friend's email and we'll open a ready-to-send referral message for you.</p>
        
        <div class="input-group" style="margin-bottom: var(--space-5);">
          <label class="input-label" for="referral-email">Friend's email</label>
          <input 
            class="input" 
            type="email" 
            id="referral-email" 
            placeholder="friend@example.com"
            autocomplete="email"
          />
          <span class="input-error-msg" id="referral-error" role="alert" aria-live="polite"></span>
        </div>

        <div class="dialog__actions" style="flex-direction: column; gap: var(--space-3);">
          <button class="btn btn--primary" id="referral-send">
            Send referral
          </button>
          <button class="btn btn--ghost" id="referral-cancel" style="width: 100%;">
            ${isPrompt ? 'Not now' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  `;

  const emailInput = document.getElementById('referral-email');
  const errorEl = document.getElementById('referral-error');

  function close() {
    container.innerHTML = '';
    onClose?.();
  }

  // Inline validation
  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !isValidEmail(email)) {
      emailInput.classList.add('input--error');
      errorEl.textContent = "That email doesn\u2019t look quite right";
    } else {
      emailInput.classList.remove('input--error');
      errorEl.textContent = '';
    }
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('input--error')) {
      emailInput.classList.remove('input--error');
      errorEl.textContent = '';
    }
  });

  // Send referral
  document.getElementById('referral-send').addEventListener('click', () => {
    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
      emailInput.classList.add('input--error');
      errorEl.textContent = "That email doesn\u2019t look quite right";
      emailInput.focus();
      return;
    }

    const { subject, body } = buildReferralEmail(senderName, email);
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoUrl;

    // Mark as shared so prompt doesn't show again
    store.dismissSharePrompt();
    close();
  });

  // Cancel / dismiss
  document.getElementById('referral-cancel').addEventListener('click', () => {
    if (isPrompt) {
      store.dismissSharePrompt();
    }
    close();
  });

  // Click overlay to close
  document.getElementById('referral-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'referral-overlay') {
      if (isPrompt) {
        store.dismissSharePrompt();
      }
      close();
    }
  });

  // Focus the input
  requestAnimationFrame(() => emailInput.focus());
}
