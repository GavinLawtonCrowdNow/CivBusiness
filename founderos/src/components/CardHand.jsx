import { ALL_CARDS } from '../game/cards.js';

const COLOR_MAP = {
  indigo: { border: '#6366f1', bg: 'rgba(99,102,241,0.1)', badge: '#6366f1' },
  blue: { border: '#3b82f6', bg: 'rgba(59,130,246,0.1)', badge: '#3b82f6' },
  emerald: { border: '#10b981', bg: 'rgba(16,185,129,0.1)', badge: '#10b981' },
  violet: { border: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', badge: '#8b5cf6' },
  amber: { border: '#f59e0b', bg: 'rgba(245,158,11,0.1)', badge: '#f59e0b' },
  slate: { border: '#64748b', bg: 'rgba(100,116,139,0.1)', badge: '#64748b' },
  pink: { border: '#ec4899', bg: 'rgba(236,72,153,0.1)', badge: '#ec4899' },
  red: { border: '#ef4444', bg: 'rgba(239,68,68,0.1)', badge: '#ef4444' },
  teal: { border: '#14b8a6', bg: 'rgba(20,184,166,0.1)', badge: '#14b8a6' },
  cyan: { border: '#06b6d4', bg: 'rgba(6,182,212,0.1)', badge: '#06b6d4' },
};

function fmt(n) {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function ActionCard({ card, isSelected, canPlay, onToggle }) {
  const colors = COLOR_MAP[card.color] ?? COLOR_MAP.indigo;

  return (
    <div
      onClick={() => canPlay && onToggle(card.id)}
      className={`action-card rounded-xl border-2 p-4 cursor-pointer select-none relative flex flex-col gap-2 min-h-[180px] ${isSelected ? 'selected' : ''} ${!canPlay ? 'opacity-40 cursor-not-allowed' : ''}`}
      style={{
        borderColor: isSelected ? colors.border : canPlay ? `${colors.border}88` : '#374151',
        background: isSelected ? colors.bg : 'rgba(15,16,22,0.8)',
        boxShadow: isSelected ? `0 0 20px ${colors.border}55` : 'none',
      }}
    >
      {isSelected && (
        <div
          className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: colors.badge, color: '#fff' }}
        >
          SELECTED
        </div>
      )}
      <div className="text-2xl">{card.icon}</div>
      <div className="text-sm font-bold text-slate-100 leading-tight">{card.name}</div>
      <div className="text-xs text-slate-400 flex-1 leading-relaxed">{card.description}</div>
      {card.cost > 0 && (
        <div className="text-xs font-mono text-red-400 mt-auto">Cost: {fmt(card.cost)}</div>
      )}
      {!canPlay && (
        <div className="text-xs text-slate-500 italic">Requirements not met</div>
      )}
    </div>
  );
}

export default function CardHand({ state, dispatch }) {
  const { hand, selectedCards } = state;
  const handCards = hand
    .map((id) => ALL_CARDS.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          🃏 Action Cards
        </h2>
        <span className="text-xs text-slate-500">
          {selectedCards.length}/2 selected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {handCards.map((card) => (
          <ActionCard
            key={card.id}
            card={card}
            isSelected={selectedCards.includes(card.id)}
            canPlay={card.canPlay(state)}
            onToggle={(id) => dispatch({ type: 'SELECT_CARD', cardId: id })}
          />
        ))}
        {handCards.length === 0 && (
          <div className="col-span-2 flex items-center justify-center text-slate-600 text-sm">
            No cards available this turn
          </div>
        )}
      </div>

      {selectedCards.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
          Playing: {selectedCards.map((id) => ALL_CARDS.find((c) => c.id === id)?.name).join(', ')}
        </div>
      )}
    </div>
  );
}
