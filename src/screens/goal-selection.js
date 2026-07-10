/**
 * Goal Selection Screen
 * 
 * Three large cards with multi-select. Back button preserves state.
 * Pre-selects saved goals when editing from settings.
 */

import { navigateTo, goBack } from '../router.js';
import { store } from '../store.js';
import { GOALS } from '../data/habits.js';

export function renderGoalSelection() {
  const goalList = Object.values(GOALS);
  const state = store.getState();
  const selected = new Set(state.goals);

  const html = `
    <div class="screen screen--no-nav" role="region" aria-label="Choose your health goals">
      <button class="back-btn" id="back-btn" aria-label="Go back">
        <span class="back-btn__arrow" aria-hidden="true">←</span> Back
      </button>

      <div class="section-header">
        <span class="section-header__step">Step 1 of 2</span>
        <h1 class="section-header__title">What matters most to you?</h1>
        <p class="section-header__desc">Pick one or more goals — your routine will be built around them.</p>
      </div>

      <div class="habits-list" id="goal-list" role="group" aria-label="Health goals">
        ${goalList.map(goal => {
          const isSelected = selected.has(goal.id);
          return `
          <div class="card goal-card ${isSelected ? 'card--selected' : ''}" 
               id="goal-card-${goal.id}" 
               data-goal="${goal.id}" 
               role="checkbox" 
               aria-checked="${isSelected}" 
               aria-label="${goal.name}: ${goal.description}"
               tabindex="0">
            <div class="goal-card__icon goal-card__icon--${goal.colorClass}" aria-hidden="true">
              ${goal.emoji}
            </div>
            <div class="goal-card__content">
              <div class="goal-card__title">${goal.name}</div>
              <div class="goal-card__desc">${goal.description}</div>
            </div>
            <div class="goal-card__check" aria-hidden="true">
              <span class="goal-card__check-icon">✓</span>
            </div>
          </div>
        `}).join('')}
      </div>

      <div class="spacer"></div>

      <div id="goal-action" style="margin-top: var(--space-6); opacity: ${selected.size > 0 ? '1' : '0'}; transition: opacity 0.3s ease; pointer-events: ${selected.size > 0 ? 'auto' : 'none'};">
        <button id="goal-continue-btn" class="btn btn--primary" aria-label="Continue to build your routine">
          Continue
        </button>
      </div>
    </div>
  `;

  return {
    html,
    nav: null,
    onMount() {
      const cards = document.querySelectorAll('[data-goal]');
      const actionEl = document.getElementById('goal-action');

      function updateAction() {
        if (selected.size > 0) {
          actionEl.style.opacity = '1';
          actionEl.style.pointerEvents = 'auto';
        } else {
          actionEl.style.opacity = '0';
          actionEl.style.pointerEvents = 'none';
        }
      }

      cards.forEach(card => {
        const handler = () => {
          const goalId = card.dataset.goal;
          if (selected.has(goalId)) {
            selected.delete(goalId);
            card.classList.remove('card--selected');
            card.setAttribute('aria-checked', 'false');
          } else {
            selected.add(goalId);
            card.classList.add('card--selected');
            card.setAttribute('aria-checked', 'true');
          }
          // Persist immediately for back-nav preservation
          store.setGoals([...selected]);
          updateAction();
        };
        card.addEventListener('click', handler);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
      });

      document.getElementById('goal-continue-btn').addEventListener('click', () => {
        store.setGoals([...selected]);
        navigateTo('routine-builder');
      });

      document.getElementById('back-btn').addEventListener('click', goBack);
    }
  };
}
