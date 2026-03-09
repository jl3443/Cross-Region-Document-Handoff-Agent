import type { ExceptionStatus } from '../../data/types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: ExceptionStatus;
  className?: string;
}

const config: Record<ExceptionStatus, { label: string; dot: string; text: string }> = {
  open: {
    label: 'Open',
    dot: 'bg-red-500',
    text: 'text-red-400',
  },
  waiting: {
    label: 'Waiting',
    dot: 'bg-amber-500',
    text: 'text-amber-400',
  },
  escalated: {
    label: 'Escalated',
    dot: 'bg-purple-500',
    text: 'text-purple-400',
  },
  'in-review': {
    label: 'In Review',
    dot: 'bg-blue-500',
    text: 'text-blue-400',
  },
  resolved: {
    label: 'Resolved',
    dot: 'bg-emerald-500',
    text: 'text-emerald-400',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, dot, text } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        text,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', dot)} aria-hidden="true" />
      {label}
    </span>
  );
}
