import { cn } from '../../lib/utils';

interface ReadinessScoreProps {
  score: number;
  label?: string;
  large?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 70) return { stroke: 'stroke-green-500', text: 'text-green-600' };
  if (score >= 40) return { stroke: 'stroke-amber-500', text: 'text-amber-600' };
  return { stroke: 'stroke-red-500', text: 'text-red-600' };
}

export function ReadinessScore({ score, label, large }: ReadinessScoreProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const { stroke, text } = getScoreColor(clamped);

  // SVG ring dimensions
  const size = large ? 148 : 88;
  const strokeWidth = large ? 10 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const statusLabel = clamped >= 100 ? 'Ready' : clamped >= 70 ? 'On Track' : clamped >= 40 ? 'At Risk' : 'Blocked';

  return (
    <div className={cn(
      'flex flex-col items-center rounded-lg border border-slate-200 bg-white',
      large ? 'px-6 py-5 flex-1' : 'px-4 py-3'
    )}>
      {large && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Readiness Score</p>
      )}
      {/* SVG ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(stroke, 'transition-all duration-500')}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(large ? 'text-3xl' : 'text-lg', 'font-bold', text)}>{clamped}%</span>
          <span className={cn(large ? 'text-sm' : 'text-xs', 'font-medium', text)}>{statusLabel}</span>
        </div>
      </div>

      {/* Below label */}
      {label && (
        <p className={cn('mt-2 text-center text-slate-500', large ? 'text-sm' : 'text-xs')}>{label}</p>
      )}
    </div>
  );
}
