import { useEffect, useRef } from 'react';

const TYPE_STYLES = {
  gain: 'text-green-400',
  loss: 'text-red-400',
  event: 'text-yellow-300',
  milestone: 'text-indigo-300 font-bold',
  win: 'text-emerald-300 font-bold',
  info: 'text-slate-300',
};

const TYPE_ICONS = {
  gain: '▲',
  loss: '▼',
  event: '⚡',
  milestone: '★',
  win: '🏆',
  info: '•',
};

export default function EventLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col h-full">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        📜 Event Log
      </h2>
      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
        {log.length === 0 && (
          <p className="text-slate-600 italic">No events yet. End your first quarter.</p>
        )}
        {log.map((entry, i) => {
          const style = TYPE_STYLES[entry.type] ?? TYPE_STYLES.info;
          const icon = TYPE_ICONS[entry.type] ?? '•';
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-slate-600 shrink-0">Q{entry.quarter}</span>
              <span className={`shrink-0 ${style}`}>{icon}</span>
              <span className={style}>{entry.text}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
