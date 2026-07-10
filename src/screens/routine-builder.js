/**
 * Routine Builder Screen
 * 
 * Shows de-duplicated habits with goal tags. Each card has an expandable
 * "See the evidence" accordion. Back button preserves all selections.
 * Pre-selects active habits when editing from settings.
 */

import { navigateTo, goBack } from '../router.js';
import { store } from '../store.js';
import { getHabitsForGoals, getHabitWhy, GOALS } from '../data/habits.js';
import { EVIDENCE, getScholarUrl } from '../data/evidence.js';

export function renderRoutineBuilder() {
  const state = store.getState();
  const habits = getHabitsForGoals(state.goals);
  const selected = new Set(state.activeHabits.filter(id => habits.some(h => h.id === id)));

  function buildGoalTags(habit) {
    return habit.goals.map(g => {
      const goal = GOALS[g];
      return `<span class="goal-tag goal-tag--${goal.colorClass}" aria-label="${goal.name}">${goal.emoji}</span>`;
    }).join('');
  }

  function buildEvidence(habit) {
    const evidence = EVIDENCE[habit.id];
    if (!evidence) return '';

    const sourcesHtml = evidence.sources.map(s =>
      `<li class="evidence-source">
        <a href="${getScholarUrl(s.title)}" target="_blank" rel="noopener noreferrer">${s.title}</a>
        <br /><span class="evidence-source__journal">${s.journal}</span>, ${s.year}. ${s.authors}
      </li>`
    ).join('');

    return `
      <button class="evidence-toggle" data-evidence-for="${habit.id}" aria-expanded="false" aria-controls="evidence-${habit.id}">
        See the evidence <span class="evidence-toggle__arrow" aria-hidden="true">↓</span>
      </button>
      <div class="evidence-panel" id="evidence-${habit.id}" role="region" aria-label="Evidence for ${habit.name}">
        <div class="evidence-content">
          <p class="evidence-summary">${evidence.summary}</p>
          <p class="evidence-sources-title">Sources</p>
          <ol class="evidence-sources">${sourcesHtml}</ol>
          <p class="evidence-disclaimer">General wellness information, not medical advice.</p>
        </div>
      </div>
    `;
  }

  const html = `
    <div class="screen screen--no-nav" role="region" aria-label="Build your daily routine">
      <button class="back-btn" id="back-btn" aria-label="Go back">
        <span class="back-btn__arrow" aria-hidden="true">←</span> Back
      </button>

      <div class="section-header">
        <span class="section-header__step">Step 2 of 2</span>
        <h1 class="section-header__title">Build your routine</h1>
        <p class="section-header__desc">Tap the habits you'd like to start with. You can always change these later.</p>
      </div>

      <div id="routine-nudge" class="nudge" style="display: ${selected.size > 5 ? 'flex' : 'none'}; margin-bottom: var(--space-3);">
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
              ${buildEvidence(habit)}
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

      // Habit toggle — only toggle when clicking the card itself, not the evidence
      cards.forEach(card => {
        const handler = (e) => {
          // Don't toggle if clicking inside evidence section or toggle button
          if (e.target.closest('.evidence-toggle') || e.target.closest('.evidence-panel') || e.target.closest('.evidence-content')) {
            return;
          }
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
          // Persist immediately for back-nav preservation
          store.setActiveHabits([...selected]);
          updateUI();
        };
        card.addEventListener('click', handler);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (e.target.closest('.evidence-toggle')) return;
            e.preventDefault();
            handler(e);
          }
        });
      });

      // Evidence accordion toggles
      document.querySelectorAll('.evidence-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const habitId = toggle.dataset.evidenceFor;
          const panel = document.getElementById(`evidence-${habitId}`);
          const isOpen = panel.classList.contains('evidence-panel--open');

          if (isOpen) {
            panel.classList.remove('evidence-panel--open');
            toggle.classList.remove('evidence-toggle--open');
            toggle.setAttribute('aria-expanded', 'false');
          } else {
            panel.classList.add('evidence-panel--open');
            toggle.classList.add('evidence-toggle--open');
            toggle.setAttribute('aria-expanded', 'true');
          }
        });
      });

      // Prevent evidence link clicks from toggling the card
      document.querySelectorAll('.evidence-content a').forEach(link => {
        link.addEventListener('click', (e) => e.stopPropagation());
      });

      document.getElementById('routine-start-btn').addEventListener('click', () => {
        store.setActiveHabits([...selected]);
        store.completeOnboarding();
        navigateTo('home');
      });

      document.getElementById('back-btn').addEventListener('click', goBack);
    }
  };
}
