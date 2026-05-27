export const PHASES = {
  SEED: 'seed',
  SERIES_A: 'series_a',
  GROWTH: 'growth',
};

export const PHASE_THRESHOLDS = {
  SERIES_A: 1_000_000,
  GROWTH: 3_000_000,
};

export const WIN_ARR = 10_000_000;
export const WIN_ACQUISITION = 20_000_000;

export const EMPLOYEE_NAMES = [
  'Sam', 'Jordan', 'Taylor', 'Alex', 'Casey', 'Morgan',
  'Riley', 'Avery', 'Quinn', 'Drew', 'Blake', 'Sage', 'Jamie', 'Reese',
];

export const ROLE_CONFIG = {
  engineer: {
    label: 'Engineer',
    icon: '👨‍💻',
    color: '#818cf8',
    yields: '+queue speed, -debt risk',
  },
  sales_rep: {
    label: 'Sales',
    icon: '💼',
    color: '#34d399',
    yields: '+$15K ARR/qtr × budget',
  },
  marketer: {
    label: 'Marketer',
    icon: '📣',
    color: '#f472b6',
    yields: '+0.5 brand/qtr',
  },
  ops: {
    label: 'Ops',
    icon: '⚙️',
    color: '#fb923c',
    yields: '-$5K burn/qtr',
  },
  unassigned: {
    label: 'Idle',
    icon: '😴',
    color: '#6b7280',
    yields: '-morale each qtr',
  },
};

export const ROLE_ORDER = ['engineer', 'sales_rep', 'marketer', 'ops', 'unassigned'];

export const INITIAL_STATE = {
  // Resources
  cash: 500_000,
  arr: 0,
  talent: 3,
  techDebt: 0,
  brand: 1,
  morale: 5,
  brandAccumulator: 0,

  // Growth model (modified by projects)
  baseArrGrowthRate: 0.03,
  permanentChurnReduction: 0,

  // Game meta
  quarter: 1,
  phase: PHASES.SEED,
  burnRate: 60_000,
  churnModifier: 0,
  churnModifierTurnsLeft: 0,
  arrMultiplier: 1,
  arrMultiplierTurnsLeft: 0,
  raisedSeedRound: false,
  seriesATriggered: false,
  _seriesAFunded: false,
  gameOver: false,
  gameResult: null,
  acquisitionOffer: null,

  // Workforce (Phase 1)
  workforce: [
    { id: 'emp_0', name: 'Sam', title: 'Founder', role: 'engineer', seniority: 2 },
    { id: 'emp_1', name: 'Jordan', title: 'BD Lead', role: 'sales_rep', seniority: 1 },
    { id: 'emp_2', name: 'Taylor', title: 'Engineer', role: 'engineer', seniority: 1 },
  ],
  nextEmpId: 3,

  // Production queue (Phase 1)
  productionQueue: [],
  completedProjects: [],

  // Budget (amplifiers for workforce yields)
  budgetSales: 20_000,
  budgetProduct: 20_000,
  budgetOps: 20_000,

  // Event log
  log: [],

  // Card hand
  hand: [],
  selectedCards: [],
};
