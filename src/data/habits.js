/**
 * LiveAhead — Complete Habit Database
 * 
 * All 10 unique habits with exact interventions and rationale from the spec.
 * Habits are stored once and tagged with multiple goals to enable deduplication.
 * 
 * Goal IDs: 'brain' | 'stress' | 'heart'
 */

export const GOALS = {
  brain: {
    id: 'brain',
    emoji: '🧠',
    name: 'Protect My Memory & Mind',
    description: 'Keep your brain sharp for decades to come.',
    colorClass: 'brain'
  },
  stress: {
    id: 'stress',
    emoji: '😌',
    name: 'Manage My Stress & Anxiety',
    description: 'Feel calmer and more steady, day to day.',
    colorClass: 'stress'
  },
  heart: {
    id: 'heart',
    emoji: '❤️',
    name: 'Protect My Heart & Long-Term Health',
    description: 'Add healthy years with small daily choices.',
    colorClass: 'heart'
  }
};

export const HABITS = [
  {
    id: 'sleep-well',
    name: 'Sleep well',
    intervention: 'Sleep 7 hours (range 6–8), consistent bedtime',
    goals: ['brain', 'stress'],
    why: {
      brain: 'The sweet spot for brain and body repair — too little or too much both raise long-term risk.',
      stress: 'Sleep and anxiety feed each other — improving one is often the fastest way to improve the other.'
    }
  },
  {
    id: 'move-daily',
    name: 'Move daily',
    intervention: '≥22 minutes of brisk walking, jogging, cycling, or swimming (or 7,000–10,000 steps)',
    goals: ['brain', 'heart', 'stress'],
    why: {
      brain: 'Blood flow from regular movement is one of the most consistent brain-protective factors researchers have found.',
      heart: 'The single strongest lever on this list for a longer life — even small amounts help a lot.',
      stress: 'Regular movement is one of the most reliable ways to ease tension and lift mood.'
    }
  },
  {
    id: 'connect',
    name: 'Connect with someone',
    intervention: 'One meaningful interaction — a call, shared meal, or real conversation',
    goals: ['brain', 'stress'],
    why: {
      brain: 'Isolation affects the brain and body like a major physical risk factor — connection is protective, not just pleasant.',
      stress: 'Social connection is one of the strongest buffers against chronic stress.'
    }
  },
  {
    id: 'limit-alcohol',
    name: 'Go easy on alcohol',
    intervention: 'Zero drinks preferred; if drinking, ≤1/day (≤7/week)',
    goals: ['brain', 'heart'],
    why: {
      brain: 'Newer research shows no level of alcohol is clearly protective for long-term brain health — less is simply better.',
      heart: 'No level of alcohol shows a clear protective effect — less is better.'
    }
  },
  {
    id: 'practice-stillness',
    name: 'Practice stillness',
    intervention: '10–20 minutes of meditation, deep breathing, prayer, or mindfulness',
    goals: ['stress'],
    why: {
      stress: 'Shown to meaningfully ease anxiety and low mood — low-cost, low-risk, and it makes every other habit easier.'
    }
  },
  {
    id: 'eat-produce',
    name: 'Eat your produce',
    intervention: '5 servings — 2 fruits + 3 vegetables (leafy greens, cruciferous veg, citrus, berries)',
    goals: ['heart'],
    why: {
      heart: 'Five a day is where the benefit maxes out — no diet overhaul needed, just hit this target.'
    }
  },
  {
    id: 'eat-nuts',
    name: 'Eat a handful of nuts',
    intervention: '~1 oz (28g) of tree nuts or peanuts (not peanut butter)',
    goals: ['heart'],
    why: {
      heart: 'A small, easy daily add-on tied to a meaningfully lower death rate in long-term studies.'
    }
  },
  {
    id: 'get-fiber',
    name: 'Get your fiber',
    intervention: '≥25g from whole foods — whole grains, legumes, vegetables, fruit',
    goals: ['heart'],
    why: {
      heart: 'Most people get about half this — closing the gap is one of the biggest single wins available.'
    }
  },
  {
    id: 'move-more-sit-less',
    name: 'Move more, sit less',
    intervention: 'Break up sitting every 30–60 minutes with 2–5 min of standing/walking; total sitting under 8 hrs/day',
    goals: ['heart'],
    why: {
      heart: 'Sitting raises risk independently of exercise — the fix is frequent short breaks, not more workouts.'
    }
  },
  {
    id: 'time-coffee',
    name: 'Time your coffee',
    intervention: 'If you drink coffee, keep it to mornings (up to 3–5 cups, filtered)',
    goals: ['heart'],
    why: {
      heart: 'Morning coffee is linked to real benefit; all-day drinking is not. Skip this habit if you don\'t drink coffee.'
    }
  }
];

/**
 * Get habits for a set of selected goals (de-duplicated).
 * Each habit appears once, with all matching goal tags visible.
 */
export function getHabitsForGoals(goalIds) {
  return HABITS.filter(habit =>
    habit.goals.some(g => goalIds.includes(g))
  );
}

/**
 * Get the "why" text for a habit, using the first matching goal.
 * Prefers the user's selected goals for context.
 */
export function getHabitWhy(habit, selectedGoals) {
  for (const goal of selectedGoals) {
    if (habit.why[goal]) return habit.why[goal];
  }
  // Fallback to the first available why
  return Object.values(habit.why)[0];
}
