function fmt(n) {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const SLIDERS = [
  {
    dept: 'sales',
    label: 'Sales budget',
    icon: '💼',
    color: '#34d399',
    hint: 'amplifies sales rep ARR',
  },
  {
    dept: 'product',
    label: 'Product budget',
    icon: '🛠️',
    color: '#818cf8',
    hint: '+0.5 queue cap per $20K',
  },
  {
    dept: 'ops',
    label: 'Ops budget',
    icon: '⚙️',
    color: '#fb923c',
    hint: 'general overhead',
  },
];

function Slider({ cfg, value, max, onChange }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-slate-400">
          {cfg.icon} {cfg.label}
        </span>
        <span className="text-[11px] font-mono font-bold" style={{ color: cfg.color }}>
          {fmt(value)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={5_000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: cfg.color }}
      />
      <div className="text-[9px] text-slate-600 mt-0.5">{cfg.hint}</div>
    </div>
  );
}

export default function BudgetPanel({ state, dispatch }) {
  const maxBudget = Math.max(20_000, Math.floor(state.cash * 0.25));

  const opsCount = state.workforce.filter((e) => e.role === 'ops').length;
  const opsDiscount = opsCount * 5_000;
  const headcountCost = state.workforce.length * 15_000;
  const budgetTotal = state.budgetSales + state.budgetProduct + state.budgetOps;
  const totalBurn = state.burnRate + headcountCost + budgetTotal - opsDiscount;
  const quarterlyRevenue = Math.round(state.arr / 4);
  const netFlow = quarterlyRevenue - totalBurn;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
        💰 Budget
      </h2>

      {SLIDERS.map((cfg) => (
        <Slider
          key={cfg.dept}
          cfg={cfg}
          value={state[`budget${cfg.dept.charAt(0).toUpperCase() + cfg.dept.slice(1)}`]}
          max={maxBudget}
          onChange={(v) => dispatch({ type: 'SET_BUDGET', dept: cfg.dept, value: v })}
        />
      ))}

      <div className="border-t border-slate-700/60 pt-2 space-y-0.5 text-[10px] font-mono mt-1">
        <div className="flex justify-between text-slate-500">
          <span>Headcount ({state.workforce.length})</span>
          <span className="text-red-400">-{fmt(headcountCost)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Budget spend</span>
          <span className="text-red-400">-{fmt(budgetTotal)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Base ops burn</span>
          <span className="text-red-400">-{fmt(state.burnRate)}</span>
        </div>
        {opsDiscount > 0 && (
          <div className="flex justify-between text-slate-500">
            <span>Ops discount</span>
            <span className="text-green-400">+{fmt(opsDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-500">
          <span>Revenue</span>
          <span className="text-green-400">+{fmt(quarterlyRevenue)}</span>
        </div>
        <div
          className={`flex justify-between font-bold border-t border-slate-600 pt-1 ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}
        >
          <span>Net / qtr</span>
          <span>
            {netFlow >= 0 ? '+' : ''}
            {fmt(Math.round(netFlow))}
          </span>
        </div>
      </div>
    </div>
  );
}
