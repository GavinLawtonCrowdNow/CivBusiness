import { useRef, useEffect, useState } from 'react';

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtArr(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function ResourcePill({ label, value, prevValue, format, icon, danger, warn }) {
  const [flash, setFlash] = useState(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (value > prevValue) setFlash('gain');
    else if (value < prevValue) setFlash('loss');
    const t = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(t);
  }, [value]);

  const base = 'flex flex-col items-center px-4 py-2 rounded-lg border transition-all duration-300';
  const color = danger
    ? 'border-red-700 bg-red-900/30 text-red-300'
    : warn
    ? 'border-yellow-700 bg-yellow-900/20 text-yellow-300'
    : 'border-slate-700 bg-slate-800/60 text-slate-200';

  return (
    <div className={`${base} ${color} ${flash === 'gain' ? 'flash-gain' : flash === 'loss' ? 'flash-loss' : ''}`}>
      <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">{icon} {label}</span>
      <span className="text-lg font-bold font-mono">{format(value)}</span>
    </div>
  );
}

export default function ResourceBar({ state, prevState }) {
  const phaseLabels = { seed: '🌱 Seed', series_a: '🚀 Series A', growth: '📈 Growth' };
  const quarterLabel = `Q${((state.quarter - 1) % 4) + 1} Y${Math.ceil(state.quarter / 4)}`;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-indigo-400 font-bold text-lg tracking-wide">FounderOS</span>
        <span className="text-slate-500 text-sm ml-2">{phaseLabels[state.phase]}</span>
        <span className="ml-auto text-slate-400 font-mono text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-600">
          {quarterLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <ResourcePill
          label="Cash" icon="💵"
          value={state.cash} prevValue={prevState?.cash ?? state.cash}
          format={fmt}
          danger={state.cash < 100_000}
          warn={state.cash < 250_000}
        />
        <ResourcePill
          label="ARR" icon="📈"
          value={state.arr} prevValue={prevState?.arr ?? state.arr}
          format={fmtArr}
        />
        <ResourcePill
          label="Talent" icon="👥"
          value={state.talent} prevValue={prevState?.talent ?? state.talent}
          format={(v) => `${v} ppl`}
        />
        <ResourcePill
          label="Tech Debt" icon="⚠️"
          value={state.techDebt} prevValue={prevState?.techDebt ?? state.techDebt}
          format={(v) => `${v} pts`}
          danger={state.techDebt >= 6}
          warn={state.techDebt >= 3}
        />
        <ResourcePill
          label="Brand" icon="⭐"
          value={state.brand} prevValue={prevState?.brand ?? state.brand}
          format={(v) => `${v}/10`}
        />
        <ResourcePill
          label="Morale" icon="😊"
          value={state.morale} prevValue={prevState?.morale ?? state.morale}
          format={(v) => `${v}/10`}
          warn={state.morale <= 3}
        />
      </div>
    </div>
  );
}
