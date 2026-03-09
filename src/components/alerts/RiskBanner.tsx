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
    <div className="w-full rounded-xl bg-gradient-to-r from-red-950 to-red-900 border border-red-500/30 px-5 py-4">
      {/* Main row */}
      <div className="flex items-center gap-6">
        {/* Left: icon + label */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 ring-1 ring-red-500/30">
            <AlertTriangle
              size={20}
              className="animate-pulse text-red-400"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-red-400">
            Critical Cutoff Risk
          </span>
        </div>

        {/* Center: key stats */}
        <div className="flex flex-1 items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400" />
            <span className="text-sm text-red-300">
              <span className="font-bold text-red-400">{blockerCount}</span>{' '}
              {blockerCount === 1 ? 'Blocker' : 'Blockers'}
            </span>
          </div>

          <div className="h-4 w-px bg-red-800" />

          <span className="text-sm text-red-300">
            <span className="font-bold text-red-400">{hoursRemaining}h</span>{' '}
            Remaining
          </span>

          <div className="h-4 w-px bg-red-800" />

          <span className="font-mono text-sm font-medium text-red-300">
            {shipmentId}
          </span>
        </div>

        {/* Right: escalation button */}
        <button
          onClick={onEscalate}
          className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          Launch Escalation
        </button>
      </div>

      {/* Issues row */}
      {issues.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {issues.map((issue, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-lg bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 ring-1 ring-red-500/20"
            >
              {issue}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
