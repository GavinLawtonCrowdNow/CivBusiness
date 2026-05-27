const SEED_EVENTS = [
  {
    id: 'engineer_quits',
    title: 'Key Engineer Quits',
    description: 'Your lead engineer left for a FAANG offer.',
    icon: '😤',
    weight: 15,
    apply: (state) => ({
      talentDelta: -1,
      techDebtDelta: 2,
      log: 'Key engineer quit — -1 Talent, +2 Tech Debt',
    }),
  },
  {
    id: 'competitor_launches',
    title: 'Competitor Launches',
    description: 'A well-funded rival entered your market.',
    icon: '⚔️',
    weight: 15,
    apply: () => ({
      churnModifier: 0.1,
      churnModifierTurns: 2,
      log: 'Competitor launched — churn +10% for 2 quarters',
    }),
  },
  {
    id: 'viral_mention',
    title: 'Viral Product Mention',
    description: 'A tech influencer tweeted about you.',
    icon: '🔥',
    weight: 20,
    apply: () => ({
      brandDelta: 2,
      log: 'Viral mention — +2 Brand',
    }),
  },
  {
    id: 'big_customer_churns',
    title: 'Big Customer Churns',
    description: 'Your largest customer cancelled their contract.',
    icon: '💔',
    weight: 15,
    apply: (state) => {
      const loss = Math.min(state.arr, 100_000 + Math.random() * 50_000);
      return {
        arrDelta: -Math.round(loss),
        log: `Major customer churned — -$${fmt(Math.round(loss))} ARR`,
      };
    },
  },
  {
    id: 'security_incident',
    title: 'Security Incident',
    description: 'A data breach hit your platform. Customers are concerned.',
    icon: '🔓',
    weight: 10,
    apply: () => ({
      cashDelta: -50_000,
      brandDelta: -2,
      log: 'Security incident — -$50K remediation, -2 Brand',
    }),
  },
  {
    id: 'nothing_happened',
    title: 'Quiet Quarter',
    description: 'A calm quarter. Heads down.',
    icon: '😶',
    weight: 15,
    apply: () => ({
      log: 'Nothing unusual this quarter — eyes on the prize',
    }),
  },
  {
    id: 'angel_investor',
    title: 'Angel Interest',
    description: 'An angel wants to write a small check.',
    icon: '👼',
    weight: 10,
    apply: () => ({
      cashDelta: 75_000,
      log: 'Angel investment — +$75K cash',
    }),
  },
];

const SERIES_A_EVENTS = [
  ...SEED_EVENTS.map((e) => ({ ...e, weight: e.weight * 0.6 })),
  {
    id: 'enterprise_churn',
    title: 'Enterprise Contract Cancelled',
    description: 'A key enterprise client terminated early.',
    icon: '📉',
    weight: 20,
    apply: (state) => {
      const loss = Math.min(state.arr, 200_000 + Math.random() * 100_000);
      return {
        arrDelta: -Math.round(loss),
        log: `Enterprise churn — -$${fmt(Math.round(loss))} ARR`,
      };
    },
  },
  {
    id: 'press_coverage',
    title: 'Major Press Coverage',
    description: 'TechCrunch ran a feature on you.',
    icon: '📰',
    weight: 20,
    apply: () => ({
      brandDelta: 3,
      log: 'TechCrunch feature — +3 Brand',
    }),
  },
  {
    id: 'acqui_hire',
    title: 'Acqui-Hire Interest',
    description: 'A Big Tech co is interested in your team.',
    icon: '🎯',
    weight: 10,
    apply: (state) => {
      const offer = 5_000_000 + state.talent * 500_000;
      return {
        acquisitionOffer: offer,
        log: `Acqui-hire offer: $${fmt(offer)} — check your options`,
      };
    },
  },
];

const GROWTH_EVENTS = [
  ...SERIES_A_EVENTS.map((e) => ({ ...e, weight: e.weight * 0.7 })),
  {
    id: 'ipo_analyst',
    title: 'IPO Analyst Coverage',
    description: 'Analysts start covering your company pre-IPO.',
    icon: '📈',
    weight: 20,
    apply: () => ({
      brandDelta: 4,
      log: 'IPO analyst coverage — +4 Brand',
    }),
  },
  {
    id: 'acquisition_offer',
    title: 'Acquisition Offer',
    description: 'A strategic acquirer made a formal offer.',
    icon: '💼',
    weight: 20,
    apply: (state) => {
      const offer = 20_000_000 + state.arr * 5 + Math.random() * 5_000_000;
      return {
        acquisitionOffer: Math.round(offer),
        log: `Acquisition offer: $${fmt(Math.round(offer))} — consider carefully`,
      };
    },
  },
];

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function weightedPick(events) {
  const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const e of events) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return events[events.length - 1];
}

export function pickRandomEvent(phase) {
  const pool =
    phase === 'growth' ? GROWTH_EVENTS :
    phase === 'series_a' ? SERIES_A_EVENTS :
    SEED_EVENTS;
  return weightedPick(pool);
}
