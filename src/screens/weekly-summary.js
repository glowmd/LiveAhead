/**
 * Weekly Summary Screen — The Emotional Core
 * 
 * Wins → growth → long-term why → dot grid → suggestion.
 * Uses the user's name for personalization.
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
  const userName = state.user?.name || '';

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

    // Build per-habit lines
    const habitLines = stats.habitStats
      .filter(h => h.daysCompleted > 0)
      .sort((a, b) => b.daysCompleted - a.daysCompleted)
      .map(h => {
        const habit = HABITS.find(hab => hab.id === h.habitId);
        if (!habit) return '';
        const dayWord = h.daysCompleted === 1 ? 'day' : 'days';
        return `<strong>${habit.name}</strong> — ${h.daysCompleted} ${dayWord}`;
      })
      .filter(Boolean);

    const missedHabits = stats.habitStats.filter(h => h.daysCompleted === 0);
    const allPracticed = missedHabits.length === 0;

    let summaryText = '';
    if (habitLines.length === 1) {
      summaryText = `You practiced ${habitLines[0]} this week. That counts.`;
    } else if (habitLines.length <= 3) {
      summaryText = `Here's how your habits shaped up: ${habitLines.join(', ')}. ${allPracticed ? 'Every single habit got attention — well done.' : `Across all habits, you logged <strong>${stats.totalCompleted} total check-offs</strong>. Each one mattered.`}`;
    } else {
      summaryText = `You logged <strong>${stats.totalCompleted} check-offs</strong> across <strong>${habitLines.length} habits</strong> this week. Here's the breakdown: ${habitLines.join(' · ')}. ${allPracticed ? 'Every habit got time this week.' : 'Every one of those counted.'}`;
    }

    return `
      <div class="weekly-summary__section">
        <h3 class="weekly-summary__section-title">Your Wins</h3>
        <p class="weekly-summary__text">${summaryText}</p>
      </div>
    `;
  }

  function buildGrowth() {
    if (stats.totalCompleted === 0) return '';

    const weakest = stats.weakestHabit;
    const weakestHabit = HABITS.find(h => h.id === weakest?.habitId);

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

  function buildWhy() {
    if (stats.totalCompleted === 0) return '';

    const bestHabit = HABITS.find(h => h.id === stats.bestHabit?.habitId);
    const habitName = bestHabit ? bestHabit.name.toLowerCase() : 'your habits';
    const nameRef = userName ? `, ${userName}` : '';

    let whyText = '';
    
    if (selectedGoals.includes('brain') && selectedGoals.includes('heart')) {
      whyText = `Those ${stats.bestHabit.daysCompleted} days of ${habitName} are doing double duty — protecting your heart and your brain. This is exactly how healthy years get built${nameRef}: quietly, one week at a time.`;
    } else if (selectedGoals.includes('brain')) {
      whyText = `Every day of ${habitName} is a deposit into your long-term brain health. Research is clear: small, consistent actions like these are what keep minds sharp for decades. You're building something that matters${nameRef}.`;
    } else if (selectedGoals.includes('stress')) {
      whyText = `This week's consistency with ${habitName} is your nervous system's best friend. The calm you're building isn't just for today — it compounds, making each week a little easier than the last.`;
    } else if (selectedGoals.includes('heart')) {
      whyText = `Each day of ${habitName} is quietly strengthening your cardiovascular health. The research is powerful: these small daily choices add up to significantly more healthy years. Keep going${nameRef}.`;
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

  function buildSuggestion() {
    if (stats.totalCompleted === 0) {
      return `
        <div class="suggestion-card" id="suggestion-card" role="button" tabindex="0" aria-label="Start fresh this week">
          <p class="suggestion-card__text">🌱 Start fresh — pick one habit to focus on this week</p>
        </div>
      `;
    }

    const rate = stats.completionRate;

    // Find the least consistent habit (lowest completion)
    const sorted = [...stats.habitStats].sort((a, b) => a.daysCompleted - b.daysCompleted);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];
    const weakestHabit = HABITS.find(h => h.id === weakest?.habitId);

    // All habits are very consistent — encourage daily goals + consider adding more
    if (rate >= 0.85) {
      return `
        <div class="suggestion-card" id="suggestion-card" role="button" tabindex="0" aria-label="You're doing great — consider adding a new habit">
          <p class="suggestion-card__text">🌟 You're crushing it. Keep meeting your daily goals, and when you're ready, think about adding a new habit — you've clearly got the rhythm for it.</p>
        </div>
      `;
    }

    // There's a clear weakest habit — suggest focusing on it
    if (weakestHabit && weakest.daysCompleted < strongest.daysCompleted) {
      const dayWord = weakest.daysCompleted === 1 ? 'day' : 'days';
      const contextText = weakest.daysCompleted === 0
        ? `didn't make it into the week`
        : `only landed on ${weakest.daysCompleted} ${dayWord}`;

      return `
        <div class="suggestion-card" id="suggestion-card" role="button" tabindex="0" aria-label="Focus on ${weakestHabit.name} next week">
          <p class="suggestion-card__text">🎯 Next week's focus: <strong>${weakestHabit.name}</strong> — it ${contextText}. Even one more day makes a difference.</p>
        </div>
      `;
    }

    // All habits are equally consistent but below 85%
    return `
      <div class="suggestion-card" id="suggestion-card" role="button" tabindex="0" aria-label="Keep building consistency">
        <p class="suggestion-card__text">🎯 All your habits are moving together — keep showing up daily. Consistency is the whole game.</p>
      </div>
    `;
  }

  const html = `
    <div class="screen" role="region" aria-label="Weekly summary">
      <div class="section-header mb-5">
        <h1 class="section-header__title">Your Week</h1>
        <p class="section-header__desc">Here's how your week shaped up${userName ? `, ${userName}` : ''}.</p>
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
