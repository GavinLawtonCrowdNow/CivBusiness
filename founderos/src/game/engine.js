import { ALL_CARDS, drawHand } from './cards.js';
import { pickRandomEvent } from './events.js';
import { PHASES, PHASE_THRESHOLDS, WIN_ARR, EMPLOYEE_NAMES } from './constants.js';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── Workforce helpers ─────────────────────────────────────────────────────────

function applyTalentDelta(workforce, delta, nextEmpId) {
  if (delta > 0) {
    const newEmps = Array.from({ length: delta }, (_, i) => ({
      id: `emp_${nextEmpId + i}`,
      name: EMPLOYEE_NAMES[(nextEmpId + i) % EMPLOYEE_NAMES.length],
      title: 'New Hire',
      role: 'unassigned',
      seniority: 1,
    }));
    return { workforce: [...workforce, ...newEmps], nextEmpId: nextEmpId + delta };
  }
  // Remove: prefer unassigned, then lowest seniority (last added)
  let wf = [...workforce];
  for (let i = 0; i < Math.abs(delta) && wf.length > 1; i++) {
    const idx = wf.findIndex((e) => e.role === 'unassigned');
    wf = idx >= 0 ? wf.filter((_, j) => j !== idx) : wf.slice(0, -1);
  }
  return { workforce: wf, nextEmpId };
}

// ── Effect applicator ─────────────────────────────────────────────────────────

function applyEffect(state, effect) {
  let s = { ...state };
  if (effect.cashDelta) s.cash += effect.cashDelta;
  if (effect.arrDelta) s.arr = Math.max(0, s.arr + effect.arrDelta);
  if (effect.techDebtDelta) s.techDebt = Math.max(0, s.techDebt + effect.techDebtDelta);
  if (effect.brandDelta) s.brand = clamp(s.brand + effect.brandDelta, 0, 10);
  if (effect.moraleDelta) s.morale = clamp(s.morale + effect.moraleDelta, 0, 10);
  if (effect.burnRateDelta) s.burnRate = Math.max(10_000, s.burnRate + effect.burnRateDelta);
  if (effect.raisedSeedRound) s.raisedSeedRound = true;
  if (effect.triggerSeriesA) s.seriesATriggered = true;
  if (effect.arrMultiplier) {
    s.arrMultiplier = effect.arrMultiplier;
    s.arrMultiplierTurnsLeft = effect.arrMultiplierTurns ?? 2;
  }
  if (effect.churnModifier) {
    s.churnModifier = effect.churnModifier;
    s.churnModifierTurnsLeft = effect.churnModifierTurns ?? 2;
  }
  if (effect.acquisitionOffer !== undefined) s.acquisitionOffer = effect.acquisitionOffer;
  // Project-specific ongoing modifiers
  if (effect.arrGrowthRateDelta) s.baseArrGrowthRate = (s.baseArrGrowthRate ?? 0.03) + effect.arrGrowthRateDelta;
  if (effect.churnRateReduction) s.permanentChurnReduction = (s.permanentChurnReduction ?? 0) + effect.churnRateReduction;

  // Workforce mutations
  if (effect.talentDelta) {
    const result = applyTalentDelta(s.workforce, effect.talentDelta, s.nextEmpId);
    s = { ...s, workforce: result.workforce, nextEmpId: result.nextEmpId };
  }
  if (effect.hireRole) {
    const result = applyTalentDelta(s.workforce, 1, s.nextEmpId);
    const wf = result.workforce.map((e, i) =>
      i === result.workforce.length - 1 ? { ...e, role: effect.hireRole } : e
    );
    s = { ...s, workforce: wf, nextEmpId: result.nextEmpId };
  }

  s.talent = s.workforce.length;
  return s;
}

// ── Core turn resolution ──────────────────────────────────────────────────────

export function resolveQuarter(state, selectedCardIds, allocations, acceptAcquisition = false) {
  if (state.gameOver) return state;

  const log = [];

  if (acceptAcquisition && state.acquisitionOffer) {
    return {
      ...state,
      gameOver: true,
      gameResult: 'acquired',
      log: [
        ...state.log,
        {
          quarter: state.quarter,
          text: `Accepted $${fmt(state.acquisitionOffer)} acquisition — exit achieved!`,
          type: 'win',
        },
      ],
    };
  }

  let s = {
    ...state,
    budgetSales: allocations.sales ?? state.budgetSales,
    budgetProduct: allocations.product ?? state.budgetProduct,
    budgetOps: allocations.ops ?? state.budgetOps,
    acquisitionOffer: null,
  };

  // ── 1. Action cards ───────────────────────────────────────────────────
  for (const id of selectedCardIds) {
    const card = ALL_CARDS.find((c) => c.id === id);
    if (!card) continue;
    if (!card.canPlay(s)) {
      log.push(`Cannot play "${card.name}" — requirements not met`);
      continue;
    }
    const effect = card.apply(s);
    s = applyEffect(s, effect);
    if (effect.log) log.push(effect.log);
  }

  // ── 2. Production queue advancement ──────────────────────────────────
  const engineers = s.workforce.filter((e) => e.role === 'engineer').length;
  const techDebtSlowdown = Math.max(0, 1 - s.techDebt * 0.05);
  const budgetBoost = Math.floor(s.budgetProduct / 20_000) * 0.5;
  const queueCapacity = Math.max(0.25, (engineers + budgetBoost) * techDebtSlowdown);

  if (s.productionQueue.length > 0) {
    let queue = [...s.productionQueue];
    const completions = [];
    let remaining = queueCapacity;

    while (remaining > 0 && queue.length > 0) {
      const head = { ...queue[0] };
      const needed = head.turnsRequired - head.progress;
      if (remaining >= needed) {
        // Completes this turn
        completions.push({ ...head, progress: head.turnsRequired });
        remaining -= needed;
        queue = queue.slice(1);
      } else {
        queue[0] = { ...head, progress: head.progress + remaining };
        remaining = 0;
      }
    }

    s = { ...s, productionQueue: queue };

    for (const done of completions) {
      const e = done.effect ?? {};
      s = applyEffect(s, e);
      s = { ...s, completedProjects: [...s.completedProjects, done.id] };
      log.push(`✅ "${done.name}" complete — ${e.log ?? 'done'}`);
    }
  }

  if (engineers === 0 && s.productionQueue.length > 0) {
    log.push('⚠ Queue stalled — no engineers assigned');
  }

  // ── 3. Workforce yields ───────────────────────────────────────────────
  const salesRepsCount = s.workforce.filter((e) => e.role === 'sales_rep').length;
  const marketersCount = s.workforce.filter((e) => e.role === 'marketer').length;
  const opsCount = s.workforce.filter((e) => e.role === 'ops').length;
  const unassignedCount = s.workforce.filter((e) => e.role === 'unassigned').length;

  // Sales reps → direct ARR
  if (salesRepsCount > 0) {
    const salesBudgetMult = 1 + s.budgetSales / 80_000;
    const repARR = Math.round(salesRepsCount * 15_000 * salesBudgetMult);
    s = { ...s, arr: s.arr + repARR };
    log.push(`Sales team (${salesRepsCount}) — +$${fmt(repARR)} ARR`);
  }

  // Marketers → brand accumulator
  if (marketersCount > 0) {
    const accumulator = (s.brandAccumulator ?? 0) + marketersCount * 0.5;
    const awarded = Math.floor(accumulator);
    s = {
      ...s,
      brandAccumulator: accumulator - awarded,
      brand: clamp(s.brand + awarded, 0, 10),
    };
    if (awarded > 0) log.push(`Marketing team (${marketersCount}) — +${awarded} Brand`);
  }

  // Unassigned → morale hit
  if (unassignedCount > 0) {
    s = { ...s, morale: clamp(s.morale - Math.ceil(unassignedCount * 0.5), 0, 10) };
    log.push(`${unassignedCount} idle employee(s) — morale hit`);
  }

  // ── 4. Quarterly revenue ──────────────────────────────────────────────
  const quarterlyRevenue = Math.round((s.arr / 4) * s.arrMultiplier);
  if (quarterlyRevenue > 0) {
    s = { ...s, cash: s.cash + quarterlyRevenue };
    log.push(`Revenue — +$${fmt(quarterlyRevenue)} cash`);
  }

  // ── 5. Churn ──────────────────────────────────────────────────────────
  const baseChurn = 0.05 + s.churnModifier - (s.permanentChurnReduction ?? 0);
  const debtChurn = s.techDebt > 3 ? 0.02 * (s.techDebt - 3) : 0;
  const churnRate = Math.max(0, baseChurn + debtChurn);
  const churnLoss = Math.round(s.arr * churnRate);
  if (churnLoss > 0) {
    s = { ...s, arr: Math.max(0, s.arr - churnLoss) };
    log.push(`Churn: -$${fmt(churnLoss)} ARR (${(churnRate * 100).toFixed(1)}% rate)`);
  }

  // ── 6. Organic ARR growth ─────────────────────────────────────────────
  const growthRate = (s.baseArrGrowthRate ?? 0.03) * s.arrMultiplier * (1 - s.techDebt * 0.02);
  const organicGain = Math.round(s.arr * growthRate);
  if (organicGain > 0) {
    s = { ...s, arr: s.arr + organicGain };
    log.push(`Organic growth — +$${fmt(organicGain)} ARR`);
  }

  // ── 7. Burn ───────────────────────────────────────────────────────────
  const opsDiscount = opsCount * 5_000;
  const headcountCost = s.workforce.length * 15_000;
  const budgetSpend = s.budgetSales + s.budgetProduct + s.budgetOps;
  const totalBurn = Math.max(10_000, s.burnRate + headcountCost + budgetSpend - opsDiscount);
  s = { ...s, cash: s.cash - totalBurn };
  log.push(`Burn: -$${fmt(totalBurn)} (base $${fmt(s.burnRate)} + headcount $${fmt(headcountCost)} + budget $${fmt(budgetSpend)} - ops -$${fmt(opsDiscount)})`);

  // ── 8. Tech debt accumulation ─────────────────────────────────────────
  // Accumulates if engineers aren't keeping up with the product budget commitment
  const engineerCoverage = engineers / Math.max(1, Math.floor(s.budgetProduct / 15_000));
  if (engineerCoverage < 0.5 && s.budgetProduct > 0) {
    s = { ...s, techDebt: s.techDebt + 1 };
    log.push('Under-staffed product team — +1 Tech Debt');
  }

  // ── 9. Tick timers ────────────────────────────────────────────────────
  if (s.churnModifierTurnsLeft > 0) {
    const t = s.churnModifierTurnsLeft - 1;
    s = { ...s, churnModifierTurnsLeft: t, churnModifier: t === 0 ? 0 : s.churnModifier };
  }
  if (s.arrMultiplierTurnsLeft > 0) {
    const t = s.arrMultiplierTurnsLeft - 1;
    s = { ...s, arrMultiplierTurnsLeft: t, arrMultiplier: t === 0 ? 1 : s.arrMultiplier };
  }

  // ── 10. Series A funding ──────────────────────────────────────────────
  if (s.seriesATriggered && !s._seriesAFunded) {
    s = { ...s, cash: s.cash + 2_000_000, _seriesAFunded: true };
    log.push('🎉 Series A closed — +$2M cash!');
  }

  // ── 11. Random event ──────────────────────────────────────────────────
  const event = pickRandomEvent(s.phase);
  const eventEffect = event.apply(s);
  s = applyEffect(s, eventEffect);
  if (eventEffect.log) log.push(`[Event] ${event.title}: ${eventEffect.log}`);

  // ── 12. Phase transition ──────────────────────────────────────────────
  if (s.arr >= PHASE_THRESHOLDS.GROWTH && s.phase !== PHASES.GROWTH) {
    s = { ...s, phase: PHASES.GROWTH };
    log.push('🎉 Entered Growth phase — scaling up!');
  } else if (s.arr >= PHASE_THRESHOLDS.SERIES_A && s.phase === PHASES.SEED) {
    s = { ...s, phase: PHASES.SERIES_A };
    log.push('🚀 Entered Series A phase!');
  }

  // ── 13. Clamp and sync ────────────────────────────────────────────────
  s = {
    ...s,
    cash: Math.round(s.cash),
    arr: Math.round(Math.max(0, s.arr)),
    talent: s.workforce.length,
    techDebt: Math.max(0, s.techDebt),
    brand: clamp(s.brand, 0, 10),
    morale: clamp(s.morale, 0, 10),
  };

  const hand = drawHand(s, 4);
  const newQuarter = s.quarter + 1;
  const newLog = [
    ...state.log,
    ...log.map((text) => ({ quarter: state.quarter, text, type: classifyLog(text) })),
  ];

  s = { ...s, quarter: newQuarter, hand, selectedCards: [], log: newLog };

  // ── 14. Win / loss ────────────────────────────────────────────────────
  if (s.arr >= WIN_ARR) return { ...s, gameOver: true, gameResult: 'win' };
  if (s.cash <= 0) {
    return {
      ...s, cash: 0, gameOver: true, gameResult: 'loss',
      log: [...s.log, { quarter: newQuarter, text: 'Cash hit zero — company bankrupt.', type: 'loss' }],
    };
  }

  return s;
}

function classifyLog(text) {
  if (text.includes('✅')) return 'milestone';
  if (text.includes('+') && (text.includes('ARR') || text.includes('cash') || text.includes('Brand'))) return 'gain';
  if (text.includes('-') && (text.includes('ARR') || text.includes('cash') || text.includes('Brand'))) return 'loss';
  if (text.includes('[Event]')) return 'event';
  if (text.includes('🎉') || text.includes('🚀')) return 'milestone';
  return 'info';
}

// ── Reducer ───────────────────────────────────────────────────────────────────

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CARD': {
      const sel = state.selectedCards;
      if (sel.includes(action.cardId)) return { ...state, selectedCards: sel.filter((c) => c !== action.cardId) };
      if (sel.length >= 2) return state;
      return { ...state, selectedCards: [...sel, action.cardId] };
    }
    case 'SET_BUDGET':
      return { ...state, [`budget${cap(action.dept)}`]: action.value };

    case 'ASSIGN_ROLE': {
      const { empId, role } = action;
      return {
        ...state,
        workforce: state.workforce.map((e) => (e.id === empId ? { ...e, role } : e)),
      };
    }
    case 'QUEUE_PROJECT': {
      if (state.productionQueue.length >= 3) return state;
      const { project } = action;
      if (state.productionQueue.some((p) => p.id === project.id)) return state;
      if (state.completedProjects.includes(project.id)) return state;
      return { ...state, productionQueue: [...state.productionQueue, { ...project, progress: 0 }] };
    }
    case 'REMOVE_FROM_QUEUE': {
      return {
        ...state,
        productionQueue: state.productionQueue.filter((p) => p.id !== action.projectId),
      };
    }
    case 'RUSH_PROJECT': {
      if (!state.productionQueue.length) return state;
      const proj = state.productionQueue[0];
      const cost = Math.round((proj.turnsRequired - proj.progress) * 25_000);
      if (state.cash < cost) return state;
      // Apply project effects immediately
      let s = applyEffect(state, proj.effect ?? {});
      s = {
        ...s,
        cash: s.cash - cost,
        techDebt: s.techDebt + 2,
        productionQueue: state.productionQueue.slice(1),
        completedProjects: [...state.completedProjects, proj.id],
        log: [
          ...state.log,
          {
            quarter: state.quarter,
            text: `Rushed "${proj.name}" for $${fmt(cost)} — +2 Tech Debt`,
            type: 'event',
          },
        ],
      };
      s.talent = s.workforce.length;
      return s;
    }
    case 'END_QUARTER':
      return resolveQuarter(state, state.selectedCards, {
        sales: state.budgetSales,
        product: state.budgetProduct,
        ops: state.budgetOps,
      });
    case 'ACCEPT_ACQUISITION':
      return resolveQuarter(state, [], {}, true);
    case 'DECLINE_ACQUISITION':
      return { ...state, acquisitionOffer: null };
    case 'NEW_GAME': {
      const init = action.INITIAL_STATE;
      return { ...init, hand: drawHand(init, 4) };
    }
    default:
      return state;
  }
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
