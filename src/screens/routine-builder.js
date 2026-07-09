/**
 * Routine Builder Screen
 * 
 * Shows de-duplicated habits for chosen goals. User taps to add/remove
 * from their routine. Gentle nudge if >5 selected.
 * 
 * Design rationale: All content is pre-curated from their goal selection.
 * No searching, no typing, no configuring. Each card shows the concrete
 * target and a one-line "why" so the user can make an informed choice
 * without reading an article. The >5 nudge respects ambition while
 * gently guiding toward sustainability.
 */

import { navigateTo } from '../router.js';
import { store } from '../store.js';
import { getHabitsForGoals, getHabitWhy, GOALS } from '../data/habits.js';

export function renderRoutineBuilder() {
  const state = store.getState();
  const habits = getHabitsForGoals(state.goals);
  // Pre-select currently active habits (for edit flow from settings)
  const selected = new Set(state.activeHabits.filter(id => habits.some(h => h.id === id)));

  function buildGoalTags(habit) {
    return habit.goals.map(g => {
      const goal = GOALS[g];
      return `<span class="goal-tag goal-tag--${goal.colorClass}" aria-label="${goal.name}">${goal.emoji}</span>`;
    }).join('');
  }

  const html = `
    <div class="screen screen--no-nav" role="region" aria-label="Build your daily routine">
      <div class="section-header">
        <span class="section-header__step">Step 2 of 2</span>
        <h1 class="section-header__title">Build your routine</h1>
        <p class="section-header__desc">Tap the habits you'd like to start with. You can always change these later.</p>
      </div>

      <div id="routine-nudge" class="nudge" style="display: none; margin-bottom: var(--space-4);">
        <span class="nudge__icon" aria-hidden="true">💡</span>
        <span>Great ambition! Most people succeed by starting with 3–5 and adding more later.</span>
      </div>

      <div class="habits-list" id="habit-list" role="group" aria-label="Available habits">
        ${habits.map(habit => {
          const isSelected = selected.has(habit.id);
          return `
          <div class="card habit-card ${isSelected ? 'card--selected' : ''}" 
               id="habit-card-${habit.id}" 
               data-habit="${habit.id}" 
               role="checkbox" 
               aria-checked="${isSelected}" 
               aria-label="${habit.name}: ${habit.intervention}"
               tabindex="0">
            <div class="habit-card__check" aria-hidden="true">
              <span class="habit-card__check-icon">✓</span>
            </div>
            <div class="habit-card__content">
              <div class="habit-card__name">${habit.name}</div>
              <div class="habit-card__intervention">${habit.intervention}</div>
              <div class="habit-card__why">${getHabitWhy(habit, state.goals)}</div>
              <div class="goal-tags">${buildGoalTags(habit)}</div>
            </div>
          </div>
        `}).join('')}
      </div>

      <div style="height: 100px;"></div>

      <div class="fixed-bottom" id="routine-action" style="opacity: ${selected.size > 0 ? '1' : '0'}; transition: opacity 0.3s ease; pointer-events: ${selected.size > 0 ? 'auto' : 'none'};">
        <button id="routine-start-btn" class="btn btn--primary" aria-label="${state.onboardingComplete ? 'Save changes' : 'Start your routine'}">
          ${state.onboardingComplete ? 'Save changes' : 'Start my routine'}
        </button>
      </div>
    </div>
  `;

  return {
    html,
    nav: null,
    onMount() {
      const cards = document.querySelectorAll('[data-habit]');
      const actionEl = document.getElementById('routine-action');
      const nudgeEl = document.getElementById('routine-nudge');

      function updateUI() {
        if (selected.size > 0) {
          actionEl.style.opacity = '1';
          actionEl.style.pointerEvents = 'auto';
        } else {
          actionEl.style.opacity = '0';
          actionEl.style.pointerEvents = 'none';
        }
        nudgeEl.style.display = selected.size > 5 ? 'flex' : 'none';
      }

      cards.forEach(card => {
        const handler = () => {
          const habitId = card.dataset.habit;
          if (selected.has(habitId)) {
            selected.delete(habitId);
            card.classList.remove('card--selected');
            card.setAttribute('aria-checked', 'false');
          } else {
            selected.add(habitId);
            card.classList.add('card--selected');
            card.setAttribute('aria-checked', 'true');
          }
          updateUI();
        };
        card.addEventListener('click', handler);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
      });

      document.getElementById('routine-start-btn').addEventListener('click', () => {
        store.setActiveHabits([...selected]);
        store.completeOnboarding();
        navigateTo('home');
      });
    }
  };
}
