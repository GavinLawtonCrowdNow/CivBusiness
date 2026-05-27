export default function EndQuarterButton({ state, dispatch }) {
  const quarterLabel = `Q${((state.quarter - 1) % 4) + 1} Y${Math.ceil(state.quarter / 4)}`;
  const nextQuarterLabel = `Q${((state.quarter) % 4) + 1} Y${Math.ceil((state.quarter + 1) / 4)}`;
  const selectedCount = state.selectedCards.length;

  return (
    <div className="flex items-center justify-between bg-slate-900 border-t border-slate-700 px-6 py-4">
      <div className="text-sm text-slate-400">
        {selectedCount === 0 && (
          <span className="text-yellow-500">⚠ No action cards selected — consider picking 1–2</span>
        )}
        {selectedCount === 1 && <span>{selectedCount} card selected</span>}
        {selectedCount === 2 && <span className="text-indigo-400">2 cards selected ✓</span>}
      </div>

      <button
        onClick={() => dispatch({ type: 'END_QUARTER' })}
        disabled={state.gameOver}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl text-sm tracking-wide transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
      >
        End {quarterLabel} → {nextQuarterLabel}
      </button>
    </div>
  );
}
