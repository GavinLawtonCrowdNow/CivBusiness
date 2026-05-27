import { ALL_CARDS, drawHand } from './cards.js';
import { pickRandomEvent } from './events.js';
import { PHASES, PHASE_THRESHOLDS, WIN_ARR, WIN_ACQUISITION } from './constants.js';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// Pure function: takes current state + player choices, returns new state
export function resolveQuarter(state, selectedCardIds, allocations, acceptAcquisition = false) {
  if (state.gameOver) return state;

  const log = [];

  // --- Handle acquisition accept ---
  if (acceptAcquisition && state.acquisitionOffer) {
    return {
      ...state,
      gameOver: true,
      gameResult: 'acquired',
      log: [
        ...state.log,
        {
          quarter: state.quarter,
          text: `Accepted acquisition offer of $${fmt(state.acquisitionOffer)}. Exit achieved!`,
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
    acquisitionOffer: null, // clear any pending offer
  };

  // --- Apply selected action cards ---
  const cards = selectedCardIds
    .map((id) => ALL_CARDS.find((c) => c.id === id))
    .filter(Boolean);

  for (const card of cards) {
    if (!card.canPlay(s)) {
      log.push(`Cannot play "${card.name}" — conditions not met`);
      continue;
    }
    const effect = card.apply(s);
    s = applyEffect(s, effect);
    if (effect.log) log.push(effect.log);
  }

  // --- Quarterly revenue (ARR → quarterly cash) ---
  const quarterlyRevenue = (s.arr / 4) * s.arrMultiplier;
  s = { ...s, cash: s.cash + quarterlyRevenue };
  if (quarterlyRevenue > 0) {
    log.push(`Revenue collected — +$${fmt(Math.round(quarterlyRevenue))} cash`);
  }

  // --- Apply churn to ARR ---
  const churnRate = 0.05 + s.churnModifier + (s.techDebt > 3 ? 0.02 * (s.techDebt - 3) : 0);
  const churnLoss = Math.round(s.arr * churnRate);
  if (churnLoss > 0) {
    s = { ...s, arr: Math.max(0, s.arr - churnLoss) };
    log.push(`Churn: -$${fmt(churnLoss)} ARR (${(churnRate * 100).toFixed(0)}% rate)`);
  }

  // --- Burn rate: base + headcount + ongoing reps + budget spend ---
  const headcountCost = s.talent * 15_000;
  const repsCost = s.salesReps * 15_000;
  const budgetSpend = s.budgetSales + s.budgetProduct + s.budgetOps;
  const totalBurn = s.burnRate + headcountCost + repsCost + budgetSpend;
  s = { ...s, cash: s.cash - totalBurn };
  log.push(`Burn: -$${fmt(totalBurn)} (ops $${fmt(s.burnRate)} + headcount $${fmt(headcountCost)} + budget $${fmt(budgetSpend)})`);

  // --- Tech debt accumulation if product under-invested ---
  if (s.budgetProduct < 10_000) {
    s = { ...s, techDebt: s.techDebt + 1 };
    log.push('Low product investment — +1 Tech Debt');
  }

  // --- Sales capacity effect on ARR (organic growth from sales team) ---
  const salesEffectiveness = (s.budgetSales / 40_000) * (1 + s.salesReps * 0.3) * (1 - s.techDebt * 0.03);
  const organicArrGain = Math.round(s.arr * 0.03 * salesEffectiveness);
  if (organicArrGain > 0) {
    s = { ...s, arr: s.arr + organicArrGain };
    log.push(`Organic growth — +$${fmt(organicArrGain)} ARR`);
  }

  // --- Tick timers ---
  if (s.churnModifierTurnsLeft > 0) {
    const newTurns = s.churnModifierTurnsLeft - 1;
    s = {
      ...s,
      churnModifierTurnsLeft: newTurns,
      churnModifier: newTurns === 0 ? 0 : s.churnModifier,
    };
  }
  if (s.arrMultiplierTurnsLeft > 0) {
    const newTurns = s.arrMultiplierTurnsLeft - 1;
    s = {
      ...s,
      arrMultiplierTurnsLeft: newTurns,
      arrMultiplier: newTurns === 0 ? 1 : s.arrMultiplier,
    };
  }

  // --- Series A funding event ---
  if (s.seriesATriggered && !s._seriesAFunded) {
    s = { ...s, cash: s.cash + 2_000_000, _seriesAFunded: true };
    log.push('Series A closed — +$2M cash!');
  }

  // --- Random event ---
  const event = pickRandomEvent(s.phase);
  const eventEffect = event.apply(s);
  s = applyEffect(s, eventEffect);
  if (eventEffect.log) log.push(`[Event] ${event.title}: ${eventEffect.log}`);

  // --- Phase transition ---
  if (s.arr >= PHASE_THRESHOLDS.GROWTH && s.phase !== PHASES.GROWTH) {
    s = { ...s, phase: PHASES.GROWTH };
    log.push('🎉 Entered Growth phase — scaling up!');
  } else if (s.arr >= PHASE_THRESHOLDS.SERIES_A && s.phase === PHASES.SEED) {
    s = { ...s, phase: PHASES.SERIES_A };
    log.push('🚀 Entered Series A phase — enterprise deals now available!');
  }

  // --- Clamp resources ---
  s = {
    ...s,
    cash: Math.round(s.cash),
    arr: Math.round(Math.max(0, s.arr)),
    talent: Math.max(1, s.talent),
    techDebt: Math.max(0, s.techDebt),
    brand: clamp(s.brand, 0, 10),
    morale: clamp(s.morale, 0, 10),
  };

  // --- Draw new hand ---
  const hand = drawHand(s, 4);

  const newQuarter = s.quarter + 1;
  const newLog = [
    ...state.log,
    ...log.map((text) => ({ quarter: state.quarter, text, type: classifyLog(text) })),
  ];

  s = { ...s, quarter: newQuarter, hand, selectedCards: [], log: newLog };

  // --- Check win/loss ---
  if (s.arr >= WIN_ARR) {
    return { ...s, gameOver: true, gameResult: 'win' };
  }
  if (s.acquisitionOffer && s.acquisitionOffer >= WIN_ACQUISITION) {
    // Don't auto-win; let player decide
  }
  if (s.cash <= 0) {
    return {
      ...s,
      cash: 0,
      gameOver: true,
      gameResult: 'loss',
      log: [...s.log, { quarter: newQuarter, text: 'Cash hit zero — company bankrupt.', type: 'loss' }],
    };
  }

  return s;
}

function applyEffect(state, effect) {
  let s = { ...state };
  if (effect.cashDelta) s.cash += effect.cashDelta;
  if (effect.arrDelta) s.arr = Math.max(0, s.arr + effect.arrDelta);
  if (effect.talentDelta) s.talent = Math.max(1, s.talent + effect.talentDelta);
  if (effect.techDebtDelta) s.techDebt = Math.max(0, s.techDebt + effect.techDebtDelta);
  if (effect.brandDelta) s.brand = clamp(s.brand + effect.brandDelta, 0, 10);
  if (effect.moraleDelta) s.morale = clamp(s.morale + effect.moraleDelta, 0, 10);
  if (effect.burnRateDelta) s.burnRate = Math.max(10_000, s.burnRate + effect.burnRateDelta);
  if (effect.salesRepsDelta) {
    s.salesReps += effect.salesRepsDelta;
    s.talent += effect.salesRepsDelta;
  }
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
  return s;
}

function classifyLog(text) {
  if (text.includes('+') && (text.includes('ARR') || text.includes('cash') || text.includes('Brand'))) return 'gain';
  if (text.includes('-') && (text.includes('ARR') || text.includes('cash') || text.includes('Brand'))) return 'loss';
  if (text.includes('[Event]')) return 'event';
  if (text.includes('🎉') || text.includes('🚀')) return 'milestone';
  return 'info';
}

// Game reducer
export function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CARD': {
      const { cardId } = action;
      const selected = state.selectedCards;
      if (selected.includes(cardId)) {
        return { ...state, selectedCards: selected.filter((c) => c !== cardId) };
      }
      if (selected.length >= 2) return state; // max 2
      return { ...state, selectedCards: [...selected, cardId] };
    }
    case 'SET_BUDGET': {
      return { ...state, [`budget${cap(action.dept)}`]: action.value };
    }
    case 'END_QUARTER': {
      return resolveQuarter(state, state.selectedCards, {
        sales: state.budgetSales,
        product: state.budgetProduct,
        ops: state.budgetOps,
      });
    }
    case 'ACCEPT_ACQUISITION': {
      return resolveQuarter(state, [], {}, true);
    }
    case 'DECLINE_ACQUISITION': {
      return { ...state, acquisitionOffer: null };
    }
    case 'NEW_GAME': {
      const { INITIAL_STATE } = action;
      const hand = drawHand(INITIAL_STATE, 4);
      return { ...INITIAL_STATE, hand };
    }
    default:
      return state;
  }
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
