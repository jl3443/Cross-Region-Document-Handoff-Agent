import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
    positive: boolean;
  };
  suffix?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  suffix,
}: KpiCardProps) {
  const isPositive = trend ? trend.positive : true;
  const trendColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const trendBg = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-white tabular-nums">
            {value}
            {suffix && <span className="text-lg font-semibold text-neutral-400 ml-0.5">{suffix}</span>}
          </p>
          {trend && (
            <div className={cn('mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5', trendBg, trendColor)}>
              {trend.direction === 'up' ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span className="text-[11px] font-medium">{trend.value}</span>
              <span className="text-[10px] text-neutral-500">vs last week</span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 ring-1 ring-neutral-700">
          <Icon size={18} className="text-neutral-300" />
        </div>
      </div>
    </div>
  );
}
