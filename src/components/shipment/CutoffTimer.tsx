import { cn, formatCountdown, getCutoffColor } from '../../lib/utils';

interface CutoffTimerProps {
  hours: number;
  warRoom?: boolean;
}

export function CutoffTimer({ hours, warRoom = false }: CutoffTimerProps) {
  const colorClass = warRoom ? 'text-red-600' : getCutoffColor(hours);

  // Progress: assume 72h total window; clamp between 0-100
  const totalWindow = 72;
  const elapsed = totalWindow - hours;
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));

  const barColor = warRoom
    ? 'bg-red-500'
    : hours > 24
      ? 'bg-green-500'
      : hours > 4
        ? 'bg-amber-500'
        : hours > 1
          ? 'bg-orange-500'
          : 'bg-red-500';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3',
        warRoom && 'animate-pulse-urgent border-red-300 bg-red-50'
      )}
    >
      {/* Large countdown number */}
      <span
        className={cn(
          'text-2xl font-bold tabular-nums tracking-tight',
          colorClass
        )}
      >
        {formatCountdown(hours)}
      </span>

      {/* Label */}
      <span className="mt-1 text-xs font-medium text-slate-500">
        to vessel cutoff
      </span>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
