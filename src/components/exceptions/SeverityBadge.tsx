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
    classes: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    classes: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20',
  },
  medium: {
    icon: AlertCircle,
    label: 'Medium',
    classes: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  },
  low: {
    icon: Info,
    label: 'Low',
    classes: 'bg-neutral-500/10 text-neutral-400 ring-1 ring-neutral-500/20',
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const { icon: Icon, label, classes } = config[severity];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium',
        classes,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
