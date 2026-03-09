import { cn } from '../../lib/utils';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export function Card({ 
  title, 
  subtitle, 
  action,
  children, 
  className,
  contentClassName,
  noPadding = false,
}: CardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden',
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && (
            <div>{action}</div>
          )}
        </div>
      )}
      <div className={cn(
        !noPadding && 'p-4',
        contentClassName
      )}>
        {children}
      </div>
    </div>
  );
}
