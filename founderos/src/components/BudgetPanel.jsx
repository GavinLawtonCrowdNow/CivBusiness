function fmt(n) {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function BudgetSlider({ label, icon, value, max, onChange, color }) {
  const pct = Math.round((value / max) * 100);

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-300">
          {icon} {label}
        </span>
        <span className={`text-sm font-mono font-bold ${color}`}>{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={5_000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>$0</span>
        <span className="text-slate-500">{pct}% of cap</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

export default function BudgetPanel({ state, dispatch }) {
  const maxBudget = Math.floor(state.cash * 0.25);

  const total = state.budgetSales + state.budgetProduct + state.budgetOps;
  const headcountCost = state.talent * 15_000;
  const repsCost = state.salesReps * 15_000;
  const projectedBurn = state.burnRate + headcountCost + repsCost + total;
  const quarterlyRevenue = state.arr / 4;
  const netFlow = quarterlyRevenue - projectedBurn;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 h-full flex flex-col">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
        📋 Budget Allocation
      </h2>

      <BudgetSlider
        label="Sales" icon="💼"
        value={state.budgetSales}
        max={maxBudget}
        onChange={(v) => dispatch({ type: 'SET_BUDGET', dept: 'sales', value: v })}
        color="#818cf8"
      />
      <BudgetSlider
        label="Product" icon="🛠️"
        value={state.budgetProduct}
        max={maxBudget}
        onChange={(v) => dispatch({ type: 'SET_BUDGET', dept: 'product', value: v })}
        color="#34d399"
      />
      <BudgetSlider
        label="Ops" icon="⚙️"
        value={state.budgetOps}
        max={maxBudget}
        onChange={(v) => dispatch({ type: 'SET_BUDGET', dept: 'ops', value: v })}
        color="#fb923c"
      />

      <div className="mt-auto border-t border-slate-700 pt-3 space-y-1 text-xs font-mono">
        <div className="flex justify-between text-slate-400">
          <span>Budget spend</span>
          <span className="text-red-400">-{fmt(total)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Headcount cost</span>
          <span className="text-red-400">-{fmt(headcountCost + repsCost)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Base burn</span>
          <span className="text-red-400">-{fmt(state.burnRate)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Revenue</span>
          <span className="text-green-400">+{fmt(Math.round(quarterlyRevenue))}</span>
        </div>
        <div className={`flex justify-between font-bold border-t border-slate-600 pt-1 ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <span>Net this quarter</span>
          <span>{netFlow >= 0 ? '+' : ''}{fmt(Math.round(netFlow))}</span>
        </div>
      </div>
    </div>
  );
}
