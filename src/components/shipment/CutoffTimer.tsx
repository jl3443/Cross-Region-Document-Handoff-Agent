import { cn, formatCountdown } from '../../lib/utils';

interface CutoffTimerProps {
  hours: number;
  warRoom?: boolean;
}

export function CutoffTimer({ hours, warRoom = false }: CutoffTimerProps) {
  const totalWindow = 72;
  const elapsed = totalWindow - hours;
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));

  const urgency =
    hours <= 1  ? 'critical' :
    hours <= 4  ? 'high' :
    hours <= 24 ? 'medium' : 'low';

  const colors = {
    critical: { text: 'text-red-400',    bar: 'bg-red-500',    ring: 'ring-red-500/20',    bg: 'bg-red-500/5' },
    high:     { text: 'text-orange-400', bar: 'bg-orange-500', ring: 'ring-orange-500/20', bg: 'bg-orange-500/5' },
    medium:   { text: 'text-amber-400',  bar: 'bg-amber-500',  ring: 'ring-amber-500/20',  bg: 'bg-amber-500/5' },
    low:      { text: 'text-emerald-400',bar: 'bg-emerald-500',ring: 'ring-emerald-500/20',bg: 'bg-emerald-500/5' },
  }[urgency];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border px-5 py-4 ring-1',
        warRoom
          ? 'animate-pulse-urgent border-red-500/30 bg-red-500/5 ring-red-500/20'
          : `border-neutral-800 ${colors.bg} ${colors.ring}`
      )}
    >
      <span className={cn('text-3xl font-bold tabular-nums tracking-tight', warRoom ? 'text-red-400' : colors.text)}>
        {formatCountdown(hours)}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        to vessel cutoff
      </span>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className={cn('h-full rounded-full transition-all', warRoom ? 'bg-red-500' : colors.bar)}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
