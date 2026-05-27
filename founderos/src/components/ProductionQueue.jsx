import { useState } from 'react';
import { getAvailableProjects, rushCostForProject } from '../game/projects.js';

function fmt(n) {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function ProgressBar({ project }) {
  const pct = Math.min(100, (project.progress / project.turnsRequired) * 100);
  const turnsLeft = Math.max(0, project.turnsRequired - project.progress).toFixed(1);
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }}
      />
      <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
        <span>{pct.toFixed(0)}%</span>
        <span>{turnsLeft} turns left</span>
      </div>
    </div>
  );
}

function QueueItem({ project, index, onRemove, onRush, cash, isFirst }) {
  const rushCost = rushCostForProject(project);
  const canRush = cash >= rushCost;

  return (
    <div className={`rounded-lg border p-2.5 ${isFirst ? 'border-indigo-700/60 bg-indigo-900/20' : 'border-slate-700/50 bg-slate-800/40'}`}>
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-base leading-none">{project.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-200 truncate">{project.name}</div>
          <div className="text-[10px] text-slate-500">{index === 0 ? 'IN PROGRESS' : `Queue #${index + 1}`}</div>
        </div>
        <div className="flex gap-1 shrink-0">
          {isFirst && (
            <button
              onClick={onRush}
              disabled={!canRush}
              className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all ${
                canRush
                  ? 'bg-amber-900/50 text-amber-300 border border-amber-700/60 hover:bg-amber-800/50'
                  : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
              }`}
              title={`Rush: ${fmt(rushCost)} + 2 Tech Debt`}
            >
              ⚡ {fmt(rushCost)}
            </button>
          )}
          <button
            onClick={onRemove}
            className="text-[9px] px-1.5 py-0.5 rounded text-slate-500 hover:text-red-400 border border-slate-700/50 hover:border-red-700/50 transition-all"
          >
            ✕
          </button>
        </div>
      </div>
      {isFirst && <ProgressBar project={project} />}
    </div>
  );
}

function ProjectCard({ project, onQueue, disabled, reason }) {
  return (
    <div
      className={`rounded-lg border p-2.5 transition-all ${
        disabled
          ? 'border-slate-800 bg-slate-900/40 opacity-50'
          : 'border-slate-700/60 bg-slate-800/50 hover:border-indigo-700/50 cursor-pointer hover:bg-slate-800'
      }`}
      onClick={() => !disabled && onQueue(project)}
    >
      <div className="flex items-start gap-1.5">
        <span className="text-base leading-none">{project.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-slate-200 leading-tight">{project.name}</div>
          <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{project.description}</div>
          <div className="flex gap-2 mt-1 text-[9px] font-mono">
            <span className="text-indigo-400">{project.turnsRequired} turns</span>
            {project.cost > 0 && <span className="text-red-400">{fmt(project.cost)}</span>}
          </div>
          {disabled && reason && (
            <div className="text-[9px] text-slate-600 italic mt-0.5">{reason}</div>
          )}
        </div>
        {!disabled && (
          <button className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-800/50 shrink-0">
            Queue
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProductionQueue({ state, dispatch }) {
  const [showPicker, setShowPicker] = useState(false);

  const engineers = state.workforce.filter((e) => e.role === 'engineer').length;
  const techDebtPenalty = Math.max(0, 1 - state.techDebt * 0.05);
  const budgetBoost = Math.floor(state.budgetProduct / 20_000) * 0.5;
  const capacity = Math.max(0.25, (engineers + budgetBoost) * techDebtPenalty);

  const queuedIds = state.productionQueue.map((p) => p.id);
  const available = getAvailableProjects(state.phase, state.completedProjects, queuedIds);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          🏗️ Production Queue
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-700/40">
            ⚡ {capacity.toFixed(1)} cap/qtr
          </span>
          {state.productionQueue.length < 3 && (
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600 hover:border-indigo-600 hover:text-indigo-300 transition-all"
            >
              {showPicker ? '✕ Close' : '+ Add'}
            </button>
          )}
        </div>
      </div>

      {/* Engineering capacity hint */}
      {state.techDebt >= 3 && (
        <div className="text-[10px] text-red-400 bg-red-900/20 border border-red-800/40 rounded px-2 py-1 mb-2 shrink-0">
          ⚠ Tech Debt slowing queue by {((1 - techDebtPenalty) * 100).toFixed(0)}%
        </div>
      )}

      {/* Current queue */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {state.productionQueue.length === 0 && !showPicker && (
          <div className="text-slate-600 text-xs text-center py-4 italic">
            No projects queued — add one to get building
          </div>
        )}
        {state.productionQueue.map((proj, i) => (
          <QueueItem
            key={proj.id}
            project={proj}
            index={i}
            isFirst={i === 0}
            cash={state.cash}
            onRemove={() => dispatch({ type: 'REMOVE_FROM_QUEUE', projectId: proj.id })}
            onRush={() => dispatch({ type: 'RUSH_PROJECT' })}
          />
        ))}

        {/* Completed projects summary */}
        {state.completedProjects.length > 0 && (
          <div className="text-[9px] text-slate-600 border-t border-slate-800 pt-1 mt-1">
            ✓ Done: {state.completedProjects.join(', ').replace(/_/g, ' ')}
          </div>
        )}
      </div>

      {/* Project picker */}
      {showPicker && (
        <div className="mt-2 border-t border-slate-700 pt-2 space-y-1.5 shrink-0 max-h-48 overflow-y-auto">
          <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Available Projects</div>
          {available.length === 0 && (
            <div className="text-xs text-slate-600 italic py-2">No projects available this phase</div>
          )}
          {available.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              disabled={false}
              onQueue={(p) => {
                dispatch({ type: 'QUEUE_PROJECT', project: p });
                if (state.productionQueue.length >= 2) setShowPicker(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
