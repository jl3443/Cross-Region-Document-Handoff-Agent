import { cn } from '../../lib/utils';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Card({ title, children, className, contentClassName }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      {title && (
        <div className="border-b border-slate-200 px-4 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </h3>
        </div>
      )}
      <div className={cn('p-4', contentClassName)}>{children}</div>
    </div>
  );
}
