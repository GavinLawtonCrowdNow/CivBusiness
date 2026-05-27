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

export const INITIAL_STATE = {
  // Resources
  cash: 500_000,
  arr: 0,
  talent: 3,
  techDebt: 0,
  brand: 1,
  morale: 5,

  // Game meta
  quarter: 1,
  phase: PHASES.SEED,
  burnRate: 60_000,  // per quarter base
  churnModifier: 0,
  churnModifierTurnsLeft: 0,
  arrMultiplier: 1,
  arrMultiplierTurnsLeft: 0,
  salesCapacity: 1,
  salesCapacityBonus: 0,
  raisedSeedRound: false,
  seriesATriggered: false,
  gameOver: false,
  gameResult: null,   // 'win' | 'loss' | 'acquired'
  acquisitionOffer: null,

  // Budget (allocated each turn, total must not exceed cash * 0.6 per turn)
  budgetSales: 20_000,
  budgetProduct: 20_000,
  budgetOps: 20_000,

  // Event log
  log: [],

  // Card hand
  hand: [],
  selectedCards: [],

  // Persistent hired reps (ongoing cost)
  salesReps: 0,
};
