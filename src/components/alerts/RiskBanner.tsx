import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBannerProps {
  shipmentId: string;
  blockerCount: number;
  hoursRemaining: number;
  issues: string[];
  onEscalate: () => void;
}

export function RiskBanner({
  shipmentId,
  blockerCount,
  hoursRemaining,
  issues,
  onEscalate,
}: RiskBannerProps) {
  return (
    <div className="w-full rounded-lg bg-[#b91c1c] px-4 py-3 shadow-lg">
      {/* Main row */}
      <div className="flex items-center gap-6">
        {/* Left: icon + label */}
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={28}
            className="animate-pulse text-white"
            strokeWidth={2.5}
          />
          <span className="text-sm font-bold uppercase tracking-wider text-white">
            Critical Cutoff Risk
          </span>
        </div>

        {/* Center: key stats */}
        <div className="flex flex-1 items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-200" />
            <span className="text-sm text-red-100">
              <span className="font-bold text-white">{blockerCount}</span>{' '}
              {blockerCount === 1 ? 'Blocker' : 'Blockers'}
            </span>
          </div>

          <div className="h-4 w-px bg-red-400/50" />

          <span className="text-sm text-red-100">
            <span className="font-bold text-white">{hoursRemaining}h</span>{' '}
            Remaining
          </span>

          <div className="h-4 w-px bg-red-400/50" />

          <span className="font-mono text-sm font-medium text-red-100">
            {shipmentId}
          </span>
        </div>

        {/* Right: escalation button */}
        <button
          onClick={onEscalate}
          className="shrink-0 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          Launch Escalation
        </button>
      </div>

      {/* Issues row */}
      {issues.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {issues.map((issue, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium text-white"
            >
              {issue}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
