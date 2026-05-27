function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function GameOverScreen({ state, onRestart }) {
  const isWin = state.gameResult === 'win' || state.gameResult === 'acquired';
  const quarters = state.quarter - 1;
  const years = (quarters / 4).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
      <div
        className={`border-2 rounded-2xl p-10 max-w-lg w-full mx-4 shadow-2xl text-center ${
          isWin
            ? 'bg-slate-800 border-emerald-500'
            : 'bg-slate-800 border-red-600'
        }`}
      >
        <div className="text-6xl mb-4">{isWin ? '🏆' : '💀'}</div>
        <h1
          className={`text-3xl font-bold mb-2 ${
            isWin ? 'text-emerald-300' : 'text-red-400'
          }`}
        >
          {state.gameResult === 'win' && 'IPO Ready!'}
          {state.gameResult === 'acquired' && 'Successful Exit!'}
          {state.gameResult === 'loss' && 'Bankrupt'}
        </h1>

        <p className="text-slate-400 mb-6 text-sm">
          {state.gameResult === 'win' && `You grew to ${fmt(state.arr)} ARR and reached unicorn territory.`}
          {state.gameResult === 'acquired' && `You accepted an acquisition offer of ${fmt(state.acquisitionOffer ?? 0)}.`}
          {state.gameResult === 'loss' && 'The runway ran dry. The company is done.'}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatBox label="Quarters Survived" value={`${quarters} (${years}y)`} />
          <StatBox label="Final ARR" value={fmt(state.arr)} />
          <StatBox label="Team Size" value={`${state.talent} people`} />
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors text-lg"
        >
          Start New Company
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-bold font-mono text-slate-200">{value}</div>
    </div>
  );
}
