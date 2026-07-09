/**
 * Home Screen — Daily Check-Off
 * 
 * The core of LiveAhead. Users see today's date, a warm greeting,
 * and their habit list. One tap marks done. That's it.
 * 
 * Design rationale: This is the 10-second interaction the user has
 * 95% of the time. Everything is visible within 1 second of opening.
 * Intervention targets show as reminder text so users never have to
 * recall the specifics. The momentum counter quietly disappears when
 * broken — no loss announcement. Date navigation lets users review
 * past days (view-only for past, editable for today).
 */

import { navigateTo } from '../router.js';
import { store, getTodayStr, formatDateStr, formatDisplayDate, isToday, isFuture } from '../store.js';
import { HABITS } from '../data/habits.js';
import { renderBottomNav } from './nav.js';

export function renderHome() {
  let viewDate = getTodayStr();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function buildHabitList(dateStr) {
    const state = store.getState();
    const activeHabits = HABITS.filter(h => state.activeHabits.includes(h.id));
    const viewingToday = isToday(dateStr);
    const viewingFuture = isFuture(dateStr);

    if (activeHabits.length === 0) {
      return `
        <div class="state-message">
          <span class="state-message__icon" aria-hidden="true">🌱</span>
          <p>Your routine is empty. Head to settings to add some habits.</p>
        </div>
      `;
    }

    const progress = store.getDayProgress(dateStr);

    // All done state
    if (viewingToday && progress.done === progress.total && progress.total > 0) {
      const habitItems = activeHabits.map(h => buildHabitItem(h, dateStr, viewingToday)).join('');
      return `
        <div class="state-message state-message--done mb-6">
          <span class="state-message__icon" aria-hidden="true">🌿</span>
          <p>That's every habit today. Your future self is quietly thanking you.</p>
        </div>
        ${habitItems}
      `;
    }

    // Zero done state (today only)
    if (viewingToday && progress.done === 0) {
      const habitItems = activeHabits.map(h => buildHabitItem(h, dateStr, viewingToday)).join('');
      return `
        <div class="state-message mb-4">
          <p>A fresh day is waiting. Start with whichever one feels easy.</p>
        </div>
        ${habitItems}
      `;
    }

    // Future date
    if (viewingFuture) {
      return `
        <div class="state-message">
          <span class="state-message__icon" aria-hidden="true">✨</span>
          <p>This day hasn't arrived yet. One step at a time.</p>
        </div>
      `;
    }

    return activeHabits.map(h => buildHabitItem(h, dateStr, viewingToday)).join('');
  }

  function buildHabitItem(habit, dateStr, isEditable) {
    const isDone = store.isHabitDone(dateStr, habit.id);
    const doneClass = isDone ? 'daily-habit--done' : '';
    const tabIndex = isEditable ? 'tabindex="0"' : '';
    const roleAttr = isEditable ? 'role="checkbox"' : 'role="status"';
    const ariaChecked = `aria-checked="${isDone}"`;
    
    return `
      <div class="daily-habit ${doneClass}" 
           id="daily-${habit.id}" 
           data-habit-id="${habit.id}"
           data-editable="${isEditable}"
           ${roleAttr}
           ${ariaChecked}
           ${tabIndex}
           aria-label="${habit.name}: ${isDone ? 'completed' : habit.intervention}">
        <div class="daily-habit__check" aria-hidden="true">
          <span class="daily-habit__check-icon">✓</span>
        </div>
        <div class="daily-habit__content">
          <div class="daily-habit__name">${habit.name}</div>
          <div class="daily-habit__target">${isDone ? 'Done' : habit.intervention}</div>
        </div>
      </div>
    `;
  }

  function buildMomentum() {
    const streak = store.getOverallStreak();
    if (streak >= 2) {
      return `
        <div class="momentum" aria-label="${streak} days in a row">
          <span aria-hidden="true">🔥</span> ${streak} day${streak === 1 ? '' : 's'} in a row
        </div>
      `;
    }
    return '';
  }

  function buildDateNav(dateStr) {
    const today = getTodayStr();
    const date = new Date(dateStr + 'T12:00:00');
    const isViewingToday = dateStr === today;

    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = formatDateStr(nextDate);
    const disableNext = nextDateStr > today;

    const dayLabel = isViewingToday ? 'Today' : formatDisplayDate(dateStr);

    return `
      <div class="date-nav">
        <button class="date-nav__btn" id="date-prev" aria-label="Previous day" data-date="${formatDateStr(prevDate)}">
          ←
        </button>
        <div>
          <span class="date-nav__label">${dayLabel}</span>
          ${!isViewingToday ? `<span class="date-nav__sublabel">${formatDisplayDate(dateStr)}</span>` : ''}
        </div>
        <button class="date-nav__btn" id="date-next" aria-label="Next day" data-date="${nextDateStr}" ${disableNext ? 'disabled' : ''}>
          →
        </button>
      </div>
    `;
  }

  function buildScreen() {
    const todayStr = getTodayStr();
    const viewingToday = viewDate === todayStr;
    const progress = store.getDayProgress(viewDate);

    const progressText = viewingToday && progress.total > 0
      ? `<p class="home-header__progress"><strong>${progress.done} of ${progress.total}</strong> habits today</p>`
      : '';

    return `
      <div class="screen" role="region" aria-label="Daily habit check-off">
        <div class="home-header">
          <p class="home-header__date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 class="home-header__greeting">${getGreeting()}</h1>
          ${progressText}
          ${viewingToday ? buildMomentum() : ''}
        </div>

        ${!viewingToday ? buildDateNav(viewDate) : ''}

        <div class="habits-list" id="habits-container">
          ${buildHabitList(viewDate)}
        </div>

        ${viewingToday ? `
          <div style="text-align: center; margin-top: var(--space-4);">
            <button class="btn btn--ghost" id="view-past-btn" aria-label="View past days">
              ← View past days
            </button>
          </div>
        ` : `
          <div style="text-align: center; margin-top: var(--space-4);">
            <button class="btn btn--ghost" id="back-today-btn" aria-label="Back to today">
              Back to today
            </button>
          </div>
        `}
      </div>
    `;
  }

  const html = buildScreen();

  return {
    html,
    nav: renderBottomNav('home'),
    onMount() {
      bindEvents();
    }
  };

  function bindEvents() {
    // Habit toggle
    document.querySelectorAll('.daily-habit[data-editable="true"]').forEach(el => {
      const handler = () => {
        const habitId = el.dataset.habitId;
        store.toggleHabit(viewDate, habitId);
        refreshScreen();
      };
      el.addEventListener('click', handler);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });

    // Date navigation
    const prevBtn = document.getElementById('date-prev');
    const nextBtn = document.getElementById('date-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        viewDate = prevBtn.dataset.date;
        refreshScreen();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!nextBtn.disabled) {
          viewDate = nextBtn.dataset.date;
          refreshScreen();
        }
      });
    }

    // View past / back to today
    const pastBtn = document.getElementById('view-past-btn');
    if (pastBtn) {
      pastBtn.addEventListener('click', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        viewDate = formatDateStr(yesterday);
        refreshScreen();
      });
    }

    const todayBtn = document.getElementById('back-today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        viewDate = getTodayStr();
        refreshScreen();
      });
    }
  }

  function refreshScreen() {
    const container = document.querySelector('.screen');
    if (!container) return;

    // Rebuild the screen content in place
    const todayStr = getTodayStr();
    const viewingToday = viewDate === todayStr;
    const progress = store.getDayProgress(viewDate);

    const greeting = getGreeting();
    const dateText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const progressText = viewingToday && progress.total > 0
      ? `<p class="home-header__progress"><strong>${progress.done} of ${progress.total}</strong> habits today</p>`
      : '';

    container.innerHTML = `
      <div class="home-header">
        <p class="home-header__date">${dateText}</p>
        <h1 class="home-header__greeting">${greeting}</h1>
        ${progressText}
        ${viewingToday ? buildMomentum() : ''}
      </div>

      ${!viewingToday ? buildDateNav(viewDate) : ''}

      <div class="habits-list" id="habits-container">
        ${buildHabitList(viewDate)}
      </div>

      ${viewingToday ? `
        <div style="text-align: center; margin-top: var(--space-4);">
          <button class="btn btn--ghost" id="view-past-btn" aria-label="View past days">
            ← View past days
          </button>
        </div>
      ` : `
        <div style="text-align: center; margin-top: var(--space-4);">
          <button class="btn btn--ghost" id="back-today-btn" aria-label="Back to today">
            Back to today
          </button>
        </div>
      `}
    `;

    bindEvents();
  }
}
