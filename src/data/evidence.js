/**
 * LiveAhead — Evidence Database
 * 
 * Verbatim evidence summaries and source citations for every habit.
 * All content is taken exactly from the spec — no fabrication, no rounding.
 * Sources link to Google Scholar searches by article title.
 */

export const EVIDENCE = {
  'move-daily': {
    summary: 'Movement has the strongest link to a longer life of any habit here. In a pooled analysis of over 660,000 adults, about 22 minutes a day of moderate activity was tied to roughly 31% lower risk of dying early — and the biggest jump in benefit comes simply from going from <em>nothing</em> to <em>something</em>. Around 7,000–10,000 steps a day gets you the same win.',
    sources: [
      {
        authors: 'Arem H, Moore SC, Patel A, et al.',
        title: 'Leisure Time Physical Activity and Mortality: A Detailed Pooled Analysis of the Dose-Response Relationship',
        journal: 'JAMA Internal Medicine',
        year: '2015'
      },
      {
        authors: 'Garcia L, Pearce M, Abbas A, et al.',
        title: 'Non-Occupational Physical Activity and Risk of Cardiovascular Disease, Cancer and Mortality Outcomes: A Dose-Response Meta-Analysis of Large Prospective Studies',
        journal: 'British Journal of Sports Medicine',
        year: '2023'
      },
      {
        authors: 'Stens NA, Bakker EA, Mañas A, et al.',
        title: 'Relationship of Daily Step Counts to All-Cause Mortality and Cardiovascular Events',
        journal: 'Journal of the American College of Cardiology',
        year: '2023'
      },
      {
        authors: 'Jayedi A, Gohari A, Shab-Bidar S.',
        title: 'Daily Step Count and All-Cause Mortality: A Dose-Response Meta-Analysis of Prospective Cohort Studies',
        journal: 'Sports Medicine',
        year: '2022'
      }
    ]
  },
  'sleep-well': {
    summary: 'Sleep follows a "sweet spot" pattern — around 7 hours a night is linked to the lowest risk, with both too little and too much associated with worse outcomes. Consistency matters enormously: in one large study, <em>regular</em> sleep timing predicted health outcomes even more strongly than total hours did. Feeling rested counts as much as the number on the clock.',
    sources: [
      {
        authors: 'Cappuccio FP, D\'Elia L, Strazzullo P, Miller MA.',
        title: 'Sleep Duration and All-Cause Mortality: A Systematic Review and Meta-Analysis of Prospective Studies',
        journal: 'Sleep',
        year: '2010'
      },
      {
        authors: 'Shen X, Wu Y, Zhang D.',
        title: 'Nighttime Sleep Duration, 24-Hour Sleep Duration and Risk of All-Cause Mortality Among Adults: A Meta-Analysis',
        journal: 'Scientific Reports',
        year: '2016'
      },
      {
        authors: 'Zhou T, Yuan Y, Xue Q, et al.',
        title: 'Adherence to a Healthy Sleep Pattern Is Associated With Lower Risks of All-Cause, Cardiovascular and Cancer-Specific Mortality',
        journal: 'Journal of Internal Medicine',
        year: '2022'
      },
      {
        authors: 'Windred DP, Burns AC, Lane JM, et al.',
        title: 'Sleep Regularity Is a Stronger Predictor of Mortality Risk Than Sleep Duration: A Prospective Cohort Study',
        journal: 'Sleep',
        year: '2024'
      },
      {
        authors: 'Ungvari Z, Fekete M, Varga P, et al.',
        title: 'Imbalanced Sleep Increases Mortality Risk by 14–34%: A Meta-Analysis',
        journal: 'GeroScience',
        year: '2025'
      }
    ]
  },
  'eat-produce': {
    summary: 'Five servings a day — about 2 fruits and 3 vegetables — is the point where the benefit levels off, so you don\'t need to overhaul your whole diet. Combining two large US cohorts with a meta-analysis of 26 studies covering 1.9 million people, five-a-day was linked to meaningfully lower risk of dying early. Leafy greens, cruciferous veg, citrus and berries do the heavy lifting; fruit juices and starchy vegetables don\'t show the same benefit.',
    sources: [
      {
        authors: 'Wang DD, Li Y, Bhupathiraju SN, et al.',
        title: 'Fruit and Vegetable Intake and Mortality: Results From 2 Prospective Cohort Studies of US Men and Women and a Meta-Analysis of 26 Cohort Studies',
        journal: 'Circulation',
        year: '2021'
      },
      {
        authors: 'Miller V, Mente A, Dehghan M, et al.',
        title: 'Fruit, Vegetable, and Legume Intake, and Cardiovascular Disease and Deaths in 18 Countries (PURE): A Prospective Cohort Study',
        journal: 'The Lancet',
        year: '2017'
      },
      {
        authors: 'Aune D, Giovannucci E, Boffetta P, et al.',
        title: 'Fruit and Vegetable Intake and the Risk of Cardiovascular Disease, Total Cancer and All-Cause Mortality: A Systematic Review and Dose-Response Meta-Analysis of Prospective Studies',
        journal: 'International Journal of Epidemiology',
        year: '2017'
      }
    ]
  },
  'eat-nuts': {
    summary: 'A small daily handful of nuts (about 1 oz / 28g) is one of the easiest wins on this list. A landmark study of nearly 119,000 people found regular nut-eaters had about a 20% lower death rate, and a dose-response review confirmed the benefit. Tree nuts and peanuts both count — peanut butter, interestingly, doesn\'t show the same effect.',
    sources: [
      {
        authors: 'Bao Y, Han J, Hu FB, et al.',
        title: 'Association of Nut Consumption with Total and Cause-Specific Mortality',
        journal: 'The New England Journal of Medicine',
        year: '2013'
      },
      {
        authors: 'Aune D, Keum N, Giovannucci E, et al.',
        title: 'Nut Consumption and Risk of Cardiovascular Disease, Total Cancer, All-Cause and Cause-Specific Mortality: A Systematic Review and Dose-Response Meta-Analysis of Prospective Studies',
        journal: 'BMC Medicine',
        year: '2016'
      },
      {
        authors: 'van den Brandt PA, Schouten LJ.',
        title: 'Relationship of Tree Nut, Peanut and Peanut Butter Intake With Total and Cause-Specific Mortality: A Cohort Study and Meta-Analysis',
        journal: 'International Journal of Epidemiology',
        year: '2015'
      }
    ]
  },
  'get-fiber': {
    summary: 'Most people get only about half the fiber they need, which makes this one of the biggest untapped wins available. A major review of 185 studies found the highest fiber-eaters had 15–30% lower risk of dying early, with the sweet spot around 25–29g a day. Every extra 10g a day is tied to roughly 10% lower risk — and it adds up fast with lentils, oats, berries, and whole grains.',
    sources: [
      {
        authors: 'Reynolds A, Mann J, Cummings J, et al.',
        title: 'Carbohydrate Quality and Human Health: A Series of Systematic Reviews and Meta-Analyses',
        journal: 'The Lancet',
        year: '2019'
      },
      {
        authors: 'Yang Y, Zhao LG, Wu QJ, Ma X, Xiang YB.',
        title: 'Association Between Dietary Fiber and Lower Risk of All-Cause Mortality: A Meta-Analysis of Cohort Studies',
        journal: 'American Journal of Epidemiology',
        year: '2015'
      },
      {
        authors: 'Ramezani F, Pourghazi F, Eslami M, et al.',
        title: 'Dietary Fiber Intake and All-Cause and Cause-Specific Mortality: An Updated Systematic Review and Meta-Analysis of Prospective Cohort Studies',
        journal: 'Clinical Nutrition',
        year: '2024'
      },
      {
        authors: 'Aune D, Keum N, Giovannucci E, et al.',
        title: 'Whole Grain Consumption and Risk of Cardiovascular Disease, Cancer, and All Cause and Cause Specific Mortality: Systematic Review and Dose-Response Meta-Analysis of Prospective Studies',
        journal: 'BMJ',
        year: '2016'
      }
    ]
  },
  'time-coffee': {
    summary: 'If you enjoy coffee, timing seems to matter. Research on over 40,000 people found morning coffee drinkers had about 16% lower risk of dying early, while drinking it throughout the day showed no clear benefit. Broader reviews point to 3–5 cups of filtered coffee a day as the range linked to lower heart-disease risk. (If you don\'t drink coffee, there\'s no need to start.)',
    sources: [
      {
        authors: 'Wang X, Ma H, Sun Q, et al.',
        title: 'Coffee Drinking Timing and Mortality in US Adults',
        journal: 'European Heart Journal',
        year: '2025'
      },
      {
        authors: 'van Dam RM, Hu FB, Willett WC.',
        title: 'Coffee, Caffeine, and Health',
        journal: 'The New England Journal of Medicine',
        year: '2020'
      },
      {
        authors: 'Poole R, Kennedy OJ, Roderick P, et al.',
        title: 'Coffee Consumption and Health: Umbrella Review of Meta-Analyses of Multiple Health Outcomes',
        journal: 'BMJ',
        year: '2017'
      },
      {
        authors: 'Liu P, Yao G, Wu Y, Ren H, Zhou Q.',
        title: 'Timing of Coffee Intake Modifies Mortality Risk in Cardiovascular-Kidney-Metabolic Syndrome',
        journal: 'FASEB Journal',
        year: '2026'
      }
    ]
  },
  'move-more-sit-less': {
    summary: 'Long stretches of sitting raise risk on their own — even for people who exercise. Across 21 countries, sitting 8+ hours a day was linked to about 20% higher risk of dying early. The good news: staying active offsets much of this, and simply swapping 30 minutes of sitting for walking measurably lowers risk. The fix is frequent short breaks, not more gym time.',
    sources: [
      {
        authors: 'Li S, Lear SA, Rangarajan S, et al.',
        title: 'Association of Sitting Time With Mortality and Cardiovascular Events in High-Income, Middle-Income, and Low-Income Countries',
        journal: 'JAMA Cardiology',
        year: '2022'
      },
      {
        authors: 'Sagelv EH, Hopstock LA, Morseth B, et al.',
        title: 'Device-Measured Physical Activity, Sedentary Time, and Risk of All-Cause Mortality',
        journal: 'British Journal of Sports Medicine',
        year: '2023'
      },
      {
        authors: 'Chang Q, Zhu Y, Liu Z, et al.',
        title: 'Replacement of Sedentary Behavior With Various Physical Activities and the Risk of All-Cause and Cause-Specific Mortality',
        journal: 'BMC Medicine',
        year: '2024'
      },
      {
        authors: 'Ekelund U, Tarp J, Steene-Johannessen J, et al.',
        title: 'Dose-Response Associations Between Accelerometry Measured Physical Activity and Sedentary Time and All Cause Mortality',
        journal: 'BMJ',
        year: '2019'
      }
    ]
  },
  'connect': {
    summary: 'Human connection is genuinely protective — not just pleasant. In a meta-analysis of 1.3 million people, social isolation was linked to about 33% higher risk of dying early. Loneliness carries its own separate risk, and it compounds: people who felt lonely across multiple years of their life faced higher risk than those who felt it briefly. One meaningful interaction a day counts.',
    sources: [
      {
        authors: 'Naito R, McKee M, Leong D, et al.',
        title: 'Social Isolation as a Risk Factor for All-Cause Mortality: Systematic Review and Meta-Analysis of Cohort Studies',
        journal: 'PLoS One',
        year: '2022'
      },
      {
        authors: 'Rico-Uribe LA, Caballero FF, Martín-María N, et al.',
        title: 'Association of Loneliness With All-Cause Mortality: A Meta-Analysis',
        journal: 'PLoS One',
        year: '2018'
      },
      {
        authors: 'Yu X, Cho TC, Westrick AC, et al.',
        title: 'Association of Cumulative Loneliness With All-Cause Mortality Among Middle-Aged and Older Adults in the United States, 1996 to 2019',
        journal: 'PNAS',
        year: '2023'
      }
    ]
  },
  'practice-stillness': {
    summary: 'A few quiet minutes a day adds up. Across 47 clinical trials, mindfulness meditation produced meaningful improvements in anxiety and low mood — and in one head-to-head trial, an 8-week mindfulness program worked as well as a standard anxiety medication. The American Heart Association considers meditation a reasonable, low-risk addition to heart-health efforts. Much of the benefit is indirect: calming stress makes every other healthy habit easier to keep.',
    sources: [
      {
        authors: 'Goyal M, Singh S, Sibinga EM, et al.',
        title: 'Meditation Programs for Psychological Stress and Well-Being: A Systematic Review and Meta-Analysis',
        journal: 'JAMA Internal Medicine',
        year: '2014'
      },
      {
        authors: 'Levine GN, Cohen BE, Commodore-Mensah Y, et al.',
        title: 'Psychological Health, Well-Being, and the Mind-Heart-Body Connection: A Scientific Statement From the American Heart Association',
        journal: 'Circulation',
        year: '2021'
      },
      {
        authors: 'Hoge EA, Bui E, Mete M, et al.',
        title: 'Mindfulness-Based Stress Reduction vs Escitalopram for the Treatment of Adults With Anxiety Disorders: A Randomized Clinical Trial',
        journal: 'JAMA Psychiatry',
        year: '2023'
      },
      {
        authors: 'Rees K, Takeda A, Court R, et al.',
        title: 'Meditation for the Primary and Secondary Prevention of Cardiovascular Disease',
        journal: 'Cochrane Database of Systematic Reviews',
        year: '2024'
      },
      {
        authors: 'Rosengren A, Hawken S, Ounpuu S, et al.',
        title: 'Association of Psychosocial Risk Factors With Risk of Acute Myocardial Infarction (The INTERHEART Study)',
        journal: 'The Lancet',
        year: '2004'
      }
    ]
  },
  'limit-alcohol': {
    summary: 'The old idea that a little alcohol is good for you hasn\'t held up. A genetic study of 278,000 people found risk rising steadily with intake and no protective "safe" amount, and an umbrella review that corrected for common study flaws found no real benefit at any level. If you do drink, less is better — keeping it to 1 drink a day or fewer.',
    sources: [
      {
        authors: 'Kassaw NA, Zhou A, Mulugeta A, et al.',
        title: 'Alcohol Consumption and the Risk of All-Cause and Cause-Specific Mortality: A Linear and Nonlinear Mendelian Randomization Study',
        journal: 'International Journal of Epidemiology',
        year: '2024'
      },
      {
        authors: 'Sarich P, Gao S, Zhu Y, Canfell K, Weber MF.',
        title: 'The Association Between Alcohol Consumption and All-Cause Mortality: An Umbrella Review of Systematic Reviews Using Lifetime Abstainers or Low-Volume Drinkers as a Reference Group',
        journal: 'Addiction',
        year: '2024'
      },
      {
        authors: 'Wood AM, Kaptoge S, Butterworth AS, et al.',
        title: 'Risk Thresholds for Alcohol Consumption: Combined Analysis of Individual-Participant Data for 599,912 Current Drinkers in 83 Prospective Studies',
        journal: 'The Lancet',
        year: '2018'
      },
      {
        authors: 'Tian Y, Liu J, Zhao Y, et al.',
        title: 'Alcohol Consumption and All-Cause and Cause-Specific Mortality Among US Adults: Prospective Cohort Study',
        journal: 'BMC Medicine',
        year: '2023'
      }
    ]
  }
};

/**
 * Build a Google Scholar search URL for an article title.
 * This is the safest approach — no fabricated DOIs or direct URLs.
 */
export function getScholarUrl(title) {
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;
}
