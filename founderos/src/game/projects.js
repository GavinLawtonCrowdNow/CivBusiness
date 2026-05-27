export const ALL_PROJECTS = [
  // ── SEED ──────────────────────────────────────────────────────────────
  {
    id: 'mvp_product',
    name: 'MVP Product',
    icon: '🛠️',
    description: 'Ship your core product. Unlocks ARR growth engine.',
    turnsRequired: 3,
    cost: 0,
    phase: 'seed',
    requires: [],
    effect: {
      brandDelta: 2,
      arrGrowthRateDelta: 0.02,
      log: '+2 Brand, ARR growth rate +2%',
    },
  },
  {
    id: 'analytics_dashboard',
    name: 'Analytics Dashboard',
    icon: '📊',
    description: 'Internal metrics sharpen every product decision.',
    turnsRequired: 2,
    cost: 10_000,
    phase: 'seed',
    requires: [],
    effect: {
      arrGrowthRateDelta: 0.01,
      log: 'ARR growth rate +1%',
    },
  },
  {
    id: 'cloud_infra',
    name: 'Cloud Infrastructure',
    icon: '☁️',
    description: 'Scalable cloud setup cuts ops costs and clears debt.',
    turnsRequired: 2,
    cost: 30_000,
    phase: 'seed',
    requires: [],
    effect: {
      burnRateDelta: -15_000,
      techDebtDelta: -2,
      log: '-$15K/qtr burn, -2 Tech Debt',
    },
  },
  {
    id: 'customer_onboarding',
    name: 'Customer Onboarding',
    icon: '🎯',
    description: 'Reduce churn by making customers successful faster.',
    turnsRequired: 2,
    cost: 0,
    phase: 'seed',
    requires: ['mvp_product'],
    effect: {
      churnRateReduction: 0.02,
      log: 'Churn rate -2% permanently',
    },
  },
  {
    id: 'payment_integration',
    name: 'Payment Integration',
    icon: '💳',
    description: 'Streamlined billing boosts expansion revenue.',
    turnsRequired: 1,
    cost: 5_000,
    phase: 'seed',
    requires: ['mvp_product'],
    effect: {
      arrGrowthRateDelta: 0.015,
      log: 'ARR growth rate +1.5%',
    },
  },

  // ── SERIES A ──────────────────────────────────────────────────────────
  {
    id: 'enterprise_sso',
    name: 'Enterprise SSO',
    icon: '🔐',
    description: 'Single sign-on is table stakes for enterprise buyers.',
    turnsRequired: 3,
    cost: 20_000,
    phase: 'series_a',
    requires: [],
    effect: {
      brandDelta: 1,
      arrGrowthRateDelta: 0.01,
      log: '+1 Brand, +1% ARR growth (enterprise deals now easier)',
    },
  },
  {
    id: 'soc2_compliance',
    name: 'SOC2 Compliance',
    icon: '🛡️',
    description: 'Security cert required for large deals.',
    turnsRequired: 4,
    cost: 50_000,
    phase: 'series_a',
    requires: [],
    effect: {
      brandDelta: 2,
      churnRateReduction: 0.01,
      log: '+2 Brand, enterprise churn -1%',
    },
  },
  {
    id: 'mobile_app',
    name: 'Mobile App',
    icon: '📱',
    description: 'Mobile expands your TAM and drives virality.',
    turnsRequired: 3,
    cost: 0,
    phase: 'series_a',
    requires: ['mvp_product'],
    effect: {
      arrGrowthRateDelta: 0.02,
      brandDelta: 1,
      log: '+2% ARR growth, +1 Brand',
    },
  },
  {
    id: 'api_platform',
    name: 'API Platform',
    icon: '🔌',
    description: 'Developer ecosystem drives inbound growth.',
    turnsRequired: 3,
    cost: 15_000,
    phase: 'series_a',
    requires: [],
    effect: {
      arrGrowthRateDelta: 0.025,
      techDebtDelta: -1,
      log: '+2.5% ARR growth, -1 Tech Debt',
    },
  },

  // ── GROWTH ────────────────────────────────────────────────────────────
  {
    id: 'ai_integration',
    name: 'AI Integration',
    icon: '🤖',
    description: 'AI features create durable product differentiation.',
    turnsRequired: 4,
    cost: 0,
    phase: 'growth',
    requires: [],
    effect: {
      brandDelta: 4,
      arrGrowthRateDelta: 0.03,
      log: '+4 Brand, +3% ARR growth',
    },
  },
  {
    id: 'international_expansion',
    name: 'International',
    icon: '🌍',
    description: 'Go global — massive ARR upside, big ops cost.',
    turnsRequired: 5,
    cost: 60_000,
    phase: 'growth',
    requires: ['soc2_compliance'],
    effect: {
      arrGrowthRateDelta: 0.04,
      burnRateDelta: 30_000,
      log: '+4% ARR growth, +$30K/qtr ops cost',
    },
  },
  {
    id: 'acquisition_platform',
    name: 'M&A Capability',
    icon: '🏦',
    description: 'Build the infrastructure to acquire smaller rivals.',
    turnsRequired: 4,
    cost: 100_000,
    phase: 'growth',
    requires: [],
    effect: {
      brandDelta: 3,
      log: '+3 Brand, M&A opportunities unlocked',
    },
  },
];

export function getAvailableProjects(phase, completedIds, queuedIds) {
  const phaseRank = { seed: 0, series_a: 1, growth: 2 };
  const currentRank = phaseRank[phase] ?? 0;

  return ALL_PROJECTS.filter((p) => {
    if (completedIds.includes(p.id)) return false;
    if (queuedIds.includes(p.id)) return false;
    if ((phaseRank[p.phase] ?? 0) > currentRank) return false;
    if (p.requires?.length && !p.requires.every((r) => completedIds.includes(r))) return false;
    return true;
  });
}

export function rushCostForProject(project) {
  const turnsLeft = project.turnsRequired - project.progress;
  return Math.round(turnsLeft * 25_000);
}
