export const ALL_CARDS = [
  {
    id: 'cold_outreach',
    name: 'Cold Outreach Campaign',
    description: 'Launch an outbound sales push. Chance to land new customers.',
    cost: 20_000,
    icon: '📣',
    color: 'indigo',
    canPlay: (state) => state.cash >= 20_000,
    apply: (state) => {
      const successChance = 0.5 + (state.budgetSales / 100_000) * 0.3 + (state.brand - 1) * 0.05;
      const roll = Math.random();
      if (roll < successChance) {
        const gain = 50_000 + Math.random() * 100_000 + state.salesCapacity * 20_000;
        return {
          cashDelta: -20_000,
          arrDelta: Math.round(gain),
          log: `Cold Outreach succeeded — +$${fmt(Math.round(gain))} ARR`,
        };
      }
      return {
        cashDelta: -20_000,
        arrDelta: 0,
        log: 'Cold Outreach fizzled — no new deals closed',
      };
    },
  },
  {
    id: 'enterprise_demo',
    name: 'Enterprise Demo Push',
    description: 'Pursue a high-value enterprise deal. Requires Brand ≥ 3.',
    cost: 0,
    icon: '🏢',
    color: 'blue',
    canPlay: (state) => state.brand >= 3,
    apply: (state) => {
      const successChance = 0.45 + (state.brand - 3) * 0.1 + (state.budgetSales / 80_000) * 0.2;
      const roll = Math.random();
      if (roll < successChance) {
        const gain = 200_000 + Math.random() * 400_000;
        return {
          cashDelta: 0,
          arrDelta: Math.round(gain),
          log: `Enterprise deal closed — +$${fmt(Math.round(gain))} ARR`,
        };
      }
      return {
        cashDelta: 0,
        arrDelta: 0,
        log: 'Enterprise demo went nowhere — prospect ghosted',
      };
    },
  },
  {
    id: 'hire_sales_rep',
    name: 'Hire Sales Rep',
    description: 'Add a sales rep (+1 Talent, +Sales capacity). Ongoing $15K/qtr cost.',
    cost: 15_000,
    icon: '👤',
    color: 'emerald',
    canPlay: (state) => state.cash >= 15_000,
    apply: () => ({
      cashDelta: 0,
      talentDelta: 1,
      salesRepsDelta: 1,
      log: 'Hired a new sales rep — +1 Talent, +$15K/qtr ongoing cost',
    }),
  },
  {
    id: 'ship_feature',
    name: 'Ship Feature Release',
    description: 'Deliver product updates. Reduces Tech Debt, boosts Brand.',
    cost: 0,
    icon: '🚀',
    color: 'violet',
    canPlay: (state) => state.budgetProduct >= 15_000,
    apply: (state) => {
      const debtReduction = Math.min(state.techDebt, 1 + Math.floor(state.budgetProduct / 20_000));
      return {
        cashDelta: 0,
        techDebtDelta: -debtReduction,
        brandDelta: 1,
        log: `Shipped features — -${debtReduction} Tech Debt, +1 Brand`,
      };
    },
  },
  {
    id: 'raise_seed',
    name: 'Raise Seed Round',
    description: 'Close a $500K seed round. Available once per game.',
    cost: 0,
    icon: '💰',
    color: 'amber',
    canPlay: (state) => !state.raisedSeedRound && state.phase === 'seed',
    apply: () => ({
      cashDelta: 500_000,
      raisedSeedRound: true,
      log: 'Seed round closed — +$500K cash',
    }),
  },
  {
    id: 'refactor_sprint',
    name: 'Refactor Sprint',
    description: 'Clear tech debt aggressively. -3 Tech Debt.',
    cost: 0,
    icon: '🔧',
    color: 'slate',
    canPlay: (state) => state.techDebt > 0 && state.budgetProduct >= 10_000,
    apply: (state) => {
      const reduction = Math.min(state.techDebt, 3);
      return {
        cashDelta: 0,
        techDebtDelta: -reduction,
        log: `Refactor sprint complete — -${reduction} Tech Debt`,
      };
    },
  },
  {
    id: 'pr_blitz',
    name: 'PR Blitz',
    description: 'Aggressive press & marketing push. +2 Brand.',
    cost: 30_000,
    icon: '📰',
    color: 'pink',
    canPlay: (state) => state.cash >= 30_000,
    apply: () => ({
      cashDelta: -30_000,
      brandDelta: 2,
      log: 'PR Blitz executed — +2 Brand',
    }),
  },
  {
    id: 'cut_costs',
    name: 'Cut Costs',
    description: 'Reduce burn by $10K/qtr. Temporary morale hit (-1).',
    cost: 0,
    icon: '✂️',
    color: 'red',
    canPlay: () => true,
    apply: () => ({
      cashDelta: 0,
      burnRateDelta: -10_000,
      moraleDelta: -1,
      log: 'Cut costs — -$10K burn rate, -1 morale (2 turns)',
    }),
  },
  {
    id: 'strategic_partnership',
    name: 'Strategic Partnership',
    description: 'ARR multiplier x1.5 for 2 turns. Requires Brand ≥ 4.',
    cost: 0,
    icon: '🤝',
    color: 'teal',
    canPlay: (state) => state.brand >= 4 && state.arrMultiplierTurnsLeft === 0,
    apply: () => ({
      cashDelta: 0,
      arrMultiplier: 1.5,
      arrMultiplierTurns: 2,
      log: 'Strategic partnership secured — ARR x1.5 for 2 quarters',
    }),
  },
  {
    id: 'investor_pitch',
    name: 'Investor Pitch',
    description: 'Pitch Series A. Triggers funding event if ARR ≥ $800K.',
    cost: 0,
    icon: '📊',
    color: 'cyan',
    canPlay: (state) => state.arr >= 800_000 && !state.seriesATriggered,
    apply: () => ({
      cashDelta: 0,
      triggerSeriesA: true,
      log: 'Investor pitch delivered — Series A process begins!',
    }),
  },
];

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function drawHand(state, count = 4) {
  const available = ALL_CARDS.filter((c) => {
    // Filter out already-used once-per-game cards
    if (c.id === 'raise_seed' && state.raisedSeedRound) return false;
    if (c.id === 'investor_pitch' && state.seriesATriggered) return false;
    return true;
  });

  // Shuffle and pick
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((c) => c.id);
}
