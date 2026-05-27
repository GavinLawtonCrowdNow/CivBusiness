export const ALL_CARDS = [
  {
    id: 'cold_outreach',
    name: 'Cold Outreach Campaign',
    description: 'Outbound sales push. Scales with your Sales reps.',
    cost: 20_000,
    icon: '📣',
    color: 'indigo',
    canPlay: (state) => state.cash >= 20_000,
    apply: (state) => {
      const salesRepsCount = state.workforce.filter((e) => e.role === 'sales_rep').length;
      const successChance = 0.45 + (state.budgetSales / 100_000) * 0.3 + (state.brand - 1) * 0.04;
      if (Math.random() < successChance) {
        const gain = 50_000 + Math.random() * 100_000 + salesRepsCount * 20_000;
        return {
          cashDelta: -20_000,
          arrDelta: Math.round(gain),
          log: `Cold Outreach succeeded — +$${fmt(Math.round(gain))} ARR`,
        };
      }
      return { cashDelta: -20_000, log: 'Cold Outreach fizzled — no deals closed' };
    },
  },
  {
    id: 'enterprise_demo',
    name: 'Enterprise Demo Push',
    description: 'High-value deal attempt. Requires Brand ≥ 3.',
    cost: 0,
    icon: '🏢',
    color: 'blue',
    canPlay: (state) => state.brand >= 3,
    apply: (state) => {
      const successChance = 0.45 + (state.brand - 3) * 0.1 + (state.budgetSales / 80_000) * 0.2;
      if (Math.random() < successChance) {
        const gain = 200_000 + Math.random() * 400_000;
        return {
          arrDelta: Math.round(gain),
          log: `Enterprise deal closed — +$${fmt(Math.round(gain))} ARR`,
        };
      }
      return { log: 'Enterprise demo went nowhere — prospect ghosted' };
    },
  },
  {
    id: 'hire_engineer',
    name: 'Hire Engineer',
    description: 'Add an engineer (+1 Talent, +queue speed). Ongoing $15K/qtr.',
    cost: 0,
    icon: '👨‍💻',
    color: 'violet',
    canPlay: (state) => state.cash >= 15_000,
    apply: () => ({
      hireRole: 'engineer',
      log: 'Hired an engineer — +1 Talent (Engineer role)',
    }),
  },
  {
    id: 'hire_sales_rep',
    name: 'Hire Sales Rep',
    description: 'Add a sales rep (+1 Talent, +$15K ARR/qtr). Ongoing $15K/qtr.',
    cost: 0,
    icon: '💼',
    color: 'emerald',
    canPlay: (state) => state.cash >= 15_000,
    apply: () => ({
      hireRole: 'sales_rep',
      log: 'Hired a sales rep — +1 Talent (Sales role)',
    }),
  },
  {
    id: 'raise_seed',
    name: 'Raise Seed Round',
    description: 'Close a $500K seed round. Once per game.',
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
    description: 'Engineers clear tech debt. -3 Tech Debt, requires engineers.',
    cost: 0,
    icon: '🔧',
    color: 'slate',
    canPlay: (state) =>
      state.techDebt > 0 &&
      state.workforce.filter((e) => e.role === 'engineer').length >= 1,
    apply: (state) => {
      const engineers = state.workforce.filter((e) => e.role === 'engineer').length;
      const reduction = Math.min(state.techDebt, 2 + engineers);
      return {
        techDebtDelta: -reduction,
        log: `Refactor sprint — -${reduction} Tech Debt (${engineers} engineers)`,
      };
    },
  },
  {
    id: 'pr_blitz',
    name: 'PR Blitz',
    description: 'Aggressive press push. +2 Brand.',
    cost: 30_000,
    icon: '📰',
    color: 'pink',
    canPlay: (state) => state.cash >= 30_000,
    apply: () => ({
      cashDelta: -30_000,
      brandDelta: 2,
      log: 'PR Blitz — +2 Brand',
    }),
  },
  {
    id: 'cut_costs',
    name: 'Cut Costs',
    description: 'Reduce burn $10K/qtr. Morale penalty.',
    cost: 0,
    icon: '✂️',
    color: 'red',
    canPlay: () => true,
    apply: () => ({
      burnRateDelta: -10_000,
      moraleDelta: -1,
      log: 'Cut costs — -$10K burn, -1 morale',
    }),
  },
  {
    id: 'strategic_partnership',
    name: 'Strategic Partnership',
    description: 'ARR x1.5 for 2 turns. Requires Brand ≥ 4.',
    cost: 0,
    icon: '🤝',
    color: 'teal',
    canPlay: (state) => state.brand >= 4 && state.arrMultiplierTurnsLeft === 0,
    apply: () => ({
      arrMultiplier: 1.5,
      arrMultiplierTurns: 2,
      log: 'Partnership secured — ARR x1.5 for 2 quarters',
    }),
  },
  {
    id: 'investor_pitch',
    name: 'Investor Pitch',
    description: 'Pitch Series A. Requires ARR ≥ $800K.',
    cost: 0,
    icon: '📊',
    color: 'cyan',
    canPlay: (state) => state.arr >= 800_000 && !state.seriesATriggered,
    apply: () => ({
      triggerSeriesA: true,
      log: 'Series A process begins!',
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
    if (c.id === 'raise_seed' && state.raisedSeedRound) return false;
    if (c.id === 'investor_pitch' && state.seriesATriggered) return false;
    return true;
  });
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((c) => c.id);
}
