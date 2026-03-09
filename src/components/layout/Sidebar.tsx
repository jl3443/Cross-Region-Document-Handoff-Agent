import {
  BarChart3,
  PieChart,
  Ship,
  AlertTriangle,
  FileText,
  Mail,
  Clock,
  Package,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type ViewId = 'dashboard' | 'analytics' | 'overview' | 'exceptions' | 'documents' | 'communications' | 'timeline';

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  exceptionCount: number;
  shipmentId?: string;
  shipmentStatus?: string;
  cutoffHours?: number;
  readinessPercent?: number;
}

const portfolioNav: { id: ViewId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
];

const shipmentNav: { id: ViewId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Ship },
  { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'communications', label: 'Communications', icon: Mail },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  'in-transit': { dot: 'bg-blue-500', text: 'In Transit', bg: 'bg-blue-500/10' },
  'at-port': { dot: 'bg-amber-500', text: 'At Port', bg: 'bg-amber-500/10' },
  blocked: { dot: 'bg-red-500', text: 'Blocked', bg: 'bg-red-500/10' },
  cleared: { dot: 'bg-emerald-500', text: 'Cleared', bg: 'bg-emerald-500/10' },
  'on-track': { dot: 'bg-emerald-500', text: 'On Track', bg: 'bg-emerald-500/10' },
  'at-risk': { dot: 'bg-amber-500', text: 'At Risk', bg: 'bg-amber-500/10' },
};

function NavButton({
  id,
  label,
  icon: Icon,
  isActive,
  badge,
  onClick,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      key={id}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-neutral-800 text-white'
          : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
      )}
    >
      <Icon size={18} className={cn(
        'transition-colors',
        isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
      )} />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500/20 px-1.5 text-[11px] font-semibold text-red-400 ring-1 ring-red-500/30">
          {badge}
        </span>
      )}
      {isActive && (
        <ChevronRight size={14} className="text-neutral-500" />
      )}
    </button>
  );
}

export function Sidebar({
  activeView,
  onViewChange,
  exceptionCount,
  shipmentId,
  shipmentStatus,
  cutoffHours,
  readinessPercent,
}: SidebarProps) {
  const status = shipmentStatus ? statusColors[shipmentStatus] ?? { dot: 'bg-neutral-500', text: shipmentStatus, bg: 'bg-neutral-500/10' } : null;

  return (
    <aside
      className="flex h-screen flex-col border-r border-neutral-800 bg-[#0a0a0a]"
      style={{ width: 260, minWidth: 260 }}
    >
      {/* Logo / Product Name */}
      <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <Package size={16} className="text-black" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white tracking-tight">
            DocHandoff
          </span>
          <span className="text-[10px] text-neutral-500 font-medium">Enterprise</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col px-3 pt-4 gap-6">
        {/* Portfolio section */}
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            Portfolio
          </p>
          <div className="space-y-1">
            {portfolioNav.map(({ id, label, icon }) => (
              <NavButton
                key={id}
                id={id}
                label={label}
                icon={icon}
                isActive={activeView === id}
                onClick={() => onViewChange(id)}
              />
            ))}
          </div>
        </div>

        {/* Shipment section */}
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            Shipment
          </p>
          <div className="space-y-1">
            {shipmentNav.map(({ id, label, icon }) => (
              <NavButton
                key={id}
                id={id}
                label={label}
                icon={icon}
                isActive={activeView === id}
                badge={id === 'exceptions' ? exceptionCount : undefined}
                onClick={() => onViewChange(id)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Shipment Context Panel */}
      {shipmentId && (
        <div className="mx-3 mb-3 rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Active Shipment
            </p>
            {status && (
              <div className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5', status.bg)}>
                <div className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                <span className="text-[10px] font-medium text-neutral-300">{status.text}</span>
              </div>
            )}
          </div>
          <p className="text-sm font-mono font-semibold text-white">{shipmentId}</p>
          
          <div className="grid grid-cols-2 gap-3 pt-1">
            {cutoffHours != null && (
              <div className="space-y-1">
                <p className="text-[10px] text-neutral-500">Cutoff</p>
                <p className={cn(
                  'text-lg font-bold tabular-nums',
                  cutoffHours < 8 ? 'text-red-400' : cutoffHours < 24 ? 'text-amber-400' : 'text-white'
                )}>
                  {cutoffHours}h
                </p>
              </div>
            )}
            {readinessPercent != null && (
              <div className="space-y-1">
                <p className="text-[10px] text-neutral-500">Readiness</p>
                <p className={cn(
                  'text-lg font-bold tabular-nums',
                  readinessPercent >= 100 ? 'text-emerald-400' : readinessPercent >= 70 ? 'text-blue-400' : 'text-amber-400'
                )}>
                  {readinessPercent}%
                </p>
              </div>
            )}
          </div>
          
          {readinessPercent != null && (
            <div className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  readinessPercent >= 100
                    ? 'bg-emerald-500'
                    : readinessPercent >= 70
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                )}
                style={{ width: `${Math.min(readinessPercent, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-neutral-800 px-5 py-3">
        <p className="text-[11px] text-neutral-600">
          v1.0.0
        </p>
      </div>
    </aside>
  );
}
