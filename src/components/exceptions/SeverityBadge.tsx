import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { Severity } from '../../data/types';
import { cn } from '../../lib/utils';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const config: Record<
  Severity,
  { icon: React.ElementType; label: string; classes: string }
> = {
  critical: {
    icon: ShieldAlert,
    label: 'Critical',
    classes: 'bg-red-100 text-red-700',
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    classes: 'bg-orange-100 text-orange-700',
  },
  medium: {
    icon: AlertCircle,
    label: 'Medium',
    classes: 'bg-amber-100 text-amber-700',
  },
  low: {
    icon: Info,
    label: 'Low',
    classes: 'bg-slate-100 text-slate-500',
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const { icon: Icon, label, classes } = config[severity];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        classes,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
