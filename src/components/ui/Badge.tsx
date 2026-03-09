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
  default: 'bg-slate-100 text-slate-700',
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-500',
  resolved: 'bg-green-100 text-green-700',
  accent: 'bg-[#0000B3]/10 text-[#0000B3]',
  muted: 'bg-slate-100 text-slate-600',
  warning: 'bg-amber-100 text-amber-700',
  destructive: 'bg-red-600 text-white',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
