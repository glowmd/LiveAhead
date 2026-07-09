/**
 * Weekly Summary Screen — The Emotional Core
 * 
 * Shows wins first, then one gentle growth area, then connects behavior
 * to the user's chosen goals. Includes a dot grid for visual glance and
 * one actionable suggestion.
 * 
 * Design rationale: The user doesn't analyze — the app tells the story
 * of their week in a warm, human voice. Wins are always first. Failures
 * are never listed. The long-term "why" paragraph ties this week to the
 * bigger picture, making the mundane feel meaningful.
 */

import { store } from '../store.js';
import { HABITS, GOALS } from '../data/habits.js';
import { renderBottomNav, bindNavEvents } from './nav.js';

export function renderWeeklySummary() {
  const state = store.getState();
  const stats = store.getWeekStats();
  const activeHabits = HABITS.filter(h => state.activeHabits.includes(h.id));
  const weekData = stats.weekData;
  const selectedGoals = state.goals;

  // --- Build Wins Section ---
  function buildWins() {
    if (stats.totalCompleted === 0) {
      return `
        <div class="weekly-summary__section">
          <h3 class="weekly-summary__section-title">This Week</h3>
          <p class="weekly-summary__text">
            A quiet week — and that's okay. Every week is a fresh start. Even opening this app shows you're thinking about your health, and that counts.
          </p>
        </div>
      `;
    }

    const best = stats.bestHabit;
    const bestHabit = HABITS.find(h => h.id === best?.habitId);

    if (!bestHabit) return '';

    const dayWord = best.daysCompleted === 1 ? 'day' : 'days';

    return `
      <div class="weekly-summary__section">
        <h3 class="weekly-summary__section-title">Your Wins</h3>
        <p class="weekly-summary__text">
          You practiced <strong>${bestHabit.name.toLowerCase()}</strong> ${best.daysCompleted} out of 7 ${dayWord} — your most consistent habit this week.
          ${stats.totalCompleted > best.daysCompleted
            ? ` Across all habits, you logged <strong>${stats.totalCompleted} total check-offs</strong>. Each one mattered.`
            : ' Every single one of those counted.'}
        </p>
      </div>
    `;
  }

  // --- Build Growth Section ---
  function buildGrowth() {
    if (stats.totalCompleted === 0) return '';

    const weakest = stats.weakestHabit;
    const weakestHabit = HABITS.find(h => h.id === weakest?.habitId);

    // Don't show growth if everything was perfect or we have the same best/weakest
    if (!weakestHabit || weakest.daysCompleted === stats.bestHabit.daysCompleted) {
      return `
        <div class="weekly-summary__section">
          <h3 class="weekly-summary__section-title">Looking Ahead</h3>
          <p class="weekly-summary__text">
            You were remarkably steady across all your habits. Keep this rhythm going — consistency like this is what healthy years are made of.
          </p>
        </div>
      `;
    }

    if (weakest.daysCompleted === 0) {
      return `
        <div class="weekly-summary__section">
          <h3 class="weekly-summary__section-title">One to Try</h3>
          <p class="weekly-summary__text">
            <strong>${weakestHabit.name}</strong> didn't make it into the week — that happens. Even one day next week counts. Start wherever it feels easy.
          </p>
        </div>
      `;
    }

    return `
      <div class="weekly-summary__section">
        <h3 class="weekly-summary__section-title">Room to Grow</h3>
        <p class="weekly-summary__text">
          <strong>${weakestHabit.name}</strong> was the tricky one this week (${weakest.daysCompleted} of 7 days). Even one more day next week is progress. You've got this.
        </p>
      </div>
    `;
  }

  // --- Build Long-Term Why ---
  function buildWhy() {
    if (stats.totalCompleted === 0) return '';

    const goalNames = selectedGoals.map(g => GOALS[g]?.name).filter(Boolean);
    const goalText = goalNames.length === 1
      ? goalNames[0].toLowerCase()
      : goalNames.length === 2
        ? `${goalNames[0].toLowerCase()} and ${goalNames[1].toLowerCase()}`
        : goalNames.map((g, i) => i === goalNames.length - 1 ? `and ${g.toLowerCase()}` : g.toLowerCase()).join(', ');

    const bestHabit = HABITS.find(h => h.id === stats.bestHabit?.habitId);
    const habitName = bestHabit ? bestHabit.name.toLowerCase() : 'your habits';

    // Build a warm, goal-connected paragraph
    let whyText = '';
    
    if (selectedGoals.includes('brain') && selectedGoals.includes('heart')) {
      whyText = `Those ${stats.bestHabit.daysCompleted} days of ${habitName} are doing double duty — protecting your heart and your brain. This is exactly how healthy years get built: quietly, one week at a time.`;
    } else if (selectedGoals.includes('brain')) {
      whyText = `Every day of ${habitName} is a deposit into your long-term brain health. Research is clear: small, consistent actions like these are what keep minds sharp for decades. You're building something that matters.`;
    } else if (selectedGoals.includes('stress')) {
      whyText = `This week's consistency with ${habitName} is your nervous system's best friend. The calm you're building isn't just for today — it compounds, making each week a little easier than the last.`;
    } else if (selectedGoals.includes('heart')) {
      whyText = `Each day of ${habitName} is quietly strengthening your cardiovascular health. The research is powerful: these small daily choices add up to significantly more healthy years. Keep going.`;
    } else {
      whyText = `These daily habits are quietly working in the background, adding healthy years one week at a time. Consistency beats intensity, and you're proving it.`;
    }

    return `
      <div class="weekly-summary__section">
        <h3 class="weekly-summary__section-title">The Bigger Picture</h3>
        <p class="weekly-summary__text">${whyText}</p>
      </div>
    `;
  }

  // --- Build Week Dot Grid ---
  function buildDotGrid() {
    if (activeHabits.length === 0) return '';

    const dayLabels = weekData.map(d => d.dayName);

    return `
      <div class="weekly-summary__section">
        <h3 class="weekly-summary__section-title">Your Week at a Glance</h3>
        <div class="week-grid">
          <div class="week-grid__day-labels" aria-hidden="true">
            ${dayLabels.map(d => `<span class="week-grid__day-label">${d}</span>`).join('')}
          </div>
          ${activeHabits.map(habit => `
            <div class="week-grid__row" aria-label="${habit.name}: ${weekData.filter(d => d.completedHabits.includes(habit.id)).length} of 7 days">
              <span class="week-grid__label">${habit.name}</span>
              <div class="week-grid__dots">
                ${weekData.map(day => {
                  const filled = day.completedHabits.includes(habit.id);
                  return `<div class="week-grid__dot ${filled ? 'week-grid__dot--filled' : ''}" aria-hidden="true"></div>`;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- Build Suggestion ---
  function buildSuggestion() {
    if (stats.totalCompleted === 0) {
      return `
        <div class="suggestion-card" id="suggestion-card" role="button" tabindex="0" aria-label="Start fresh this week">
          <p class="suggestion-card__text">🌱 Start fresh — pick one habit to focus on this week</p>
        </div>
      `;
    }

    const weakest = stats.weakestHabit;
    const weakestHabit = HABITS.find(h => h.id === weakest?.habitId);
    const rate = stats.completionRate;

    if (rate >= 0.85) {
      return `
        <div class="suggestion-card" id="suggestion-card" role="button" tabindex="0" aria-label="Keep your routine as is">
          <p class="suggestion-card__text">✨ Keep it exactly as is — this rhythm is working beautifully</p>
        </div>
      `;
    }

    if (weakestHabit) {
      return `
        <div class="suggestion-card" id="suggestion-card" role="button" tabindex="0" aria-label="Focus on ${weakestHabit.name} next week">
          <p class="suggestion-card__text">🎯 Next week's focus: <strong>${weakestHabit.name}</strong></p>
        </div>
      `;
    }

    return '';
  }

  const html = `
    <div class="screen" role="region" aria-label="Weekly summary">
      <div class="section-header mb-6">
        <h1 class="section-header__title">Your Week</h1>
        <p class="section-header__desc">Here's how your week shaped up.</p>
      </div>

      <div class="weekly-summary">
        ${buildWins()}
        ${buildGrowth()}
        ${buildWhy()}
        ${buildDotGrid()}
        ${buildSuggestion()}
      </div>
    </div>
  `;

  return {
    html,
    nav: renderBottomNav('summary'),
    onMount() {
      bindNavEvents();
    }
  };
}
