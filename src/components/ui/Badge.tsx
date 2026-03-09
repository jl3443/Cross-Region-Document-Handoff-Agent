import { cn } from '../../lib/utils';

type BadgeVariant =
  | 'default'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'resolved'
  | 'accent'
  | 'muted'
  | 'warning'
  | 'destructive';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:     'bg-neutral-500/10 text-neutral-400 ring-1 ring-neutral-500/20',
  critical:    'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  high:        'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20',
  medium:      'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  low:         'bg-neutral-500/10 text-neutral-500 ring-1 ring-neutral-500/20',
  resolved:    'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  accent:      'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  muted:       'bg-neutral-800 text-neutral-400 ring-1 ring-neutral-700',
  warning:     'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  destructive: 'bg-red-500 text-white',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
