function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function AcquisitionModal({ offer, onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 border-2 border-amber-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💼</div>
          <h2 className="text-2xl font-bold text-amber-300 mb-2">Acquisition Offer</h2>
          <p className="text-slate-400 text-sm">You've received a formal acquisition offer.</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 mb-6 text-center border border-amber-700/40">
          <div className="text-slate-400 text-sm mb-1">Offer Amount</div>
          <div className="text-4xl font-bold font-mono text-amber-300">{fmt(offer)}</div>
        </div>

        <p className="text-slate-400 text-sm text-center mb-6">
          {offer >= 20_000_000
            ? 'This is a life-changing exit. Accept and declare victory?'
            : 'This offer values you below $20M. Decline and keep building, or take the money?'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Accept & Exit
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 rounded-xl transition-colors"
          >
            Decline & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
