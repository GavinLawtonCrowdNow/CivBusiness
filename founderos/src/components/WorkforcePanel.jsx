import { ROLE_CONFIG, ROLE_ORDER } from '../game/constants.js';

function nextRole(role) {
  const i = ROLE_ORDER.indexOf(role);
  return ROLE_ORDER[(i + 1) % ROLE_ORDER.length];
}

function RoleBadge({ role, onClick }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <button
      onClick={onClick}
      title={`${cfg.label} · ${cfg.yields}\nClick to cycle role`}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 shrink-0"
      style={{
        background: cfg.color + '22',
        color: cfg.color,
        border: `1px solid ${cfg.color}55`,
      }}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </button>
  );
}

function EmployeeRow({ emp, onRoleChange }) {
  const cfg = ROLE_CONFIG[emp.role];
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-slate-800/70 last:border-0">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 select-none"
        style={{ background: cfg.color + '30', color: cfg.color, border: `1.5px solid ${cfg.color}66` }}
      >
        {emp.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-slate-200 font-medium truncate leading-tight">{emp.name}</div>
        <div className="text-[10px] text-slate-500 truncate">{emp.title}</div>
      </div>
      <RoleBadge role={emp.role} onClick={() => onRoleChange(emp.id, nextRole(emp.role))} />
    </div>
  );
}

function YieldGrid({ workforce }) {
  const counts = {
    engineer: workforce.filter((e) => e.role === 'engineer').length,
    sales_rep: workforce.filter((e) => e.role === 'sales_rep').length,
    marketer: workforce.filter((e) => e.role === 'marketer').length,
    ops: workforce.filter((e) => e.role === 'ops').length,
    unassigned: workforce.filter((e) => e.role === 'unassigned').length,
  };
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-mono p-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
      <span style={{ color: ROLE_CONFIG.engineer.color }}>
        👨‍💻 {counts.engineer} → {counts.engineer > 0 ? `${counts.engineer} q/turn` : 'idle queue'}
      </span>
      <span style={{ color: ROLE_CONFIG.sales_rep.color }}>
        💼 {counts.sales_rep} → +${counts.sales_rep * 15}K ARR
      </span>
      <span style={{ color: ROLE_CONFIG.marketer.color }}>
        📣 {counts.marketer} → +{(counts.marketer * 0.5).toFixed(1)} brand
      </span>
      <span style={{ color: ROLE_CONFIG.ops.color }}>
        ⚙️ {counts.ops} → -${counts.ops * 5}K burn
      </span>
      {counts.unassigned > 0 && (
        <span className="col-span-2 text-red-400">
          😴 {counts.unassigned} idle — morale hit
        </span>
      )}
    </div>
  );
}

export default function WorkforcePanel({ state, dispatch }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          👥 Workforce
        </h2>
        <span className="text-[10px] text-slate-500">{state.workforce.length} people · click role to cycle</span>
      </div>

      <div className="space-y-0">
        {state.workforce.map((emp) => (
          <EmployeeRow
            key={emp.id}
            emp={emp}
            onRoleChange={(empId, role) => dispatch({ type: 'ASSIGN_ROLE', empId, role })}
          />
        ))}
      </div>

      <YieldGrid workforce={state.workforce} />
    </div>
  );
}
