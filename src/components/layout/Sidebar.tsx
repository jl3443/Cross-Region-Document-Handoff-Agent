import {
  BarChart3,
  PieChart,
  Ship,
  AlertTriangle,
  FileText,
  Mail,
  Clock,
  FileCheck,
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
  { id: 'overview', label: 'Shipment Overview', icon: Ship },
  { id: 'exceptions', label: 'Exceptions', icon: AlertTriangle },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'communications', label: 'Communications', icon: Mail },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

const statusColors: Record<string, { dot: string; text: string }> = {
  'in-transit': { dot: 'bg-blue-400', text: 'In Transit' },
  'at-port': { dot: 'bg-amber-400', text: 'At Port' },
  blocked: { dot: 'bg-red-500', text: 'Blocked' },
  cleared: { dot: 'bg-green-500', text: 'Cleared' },
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
        'group flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'border-l-[3px] border-l-[#0000B3] bg-[#1e293b] text-white'
          : 'border-l-[3px] border-l-transparent text-[#cbd5e1] hover:bg-[#1e293b]/50 hover:text-[#f1f5f9]'
      )}
    >
      <Icon size={20} className={isActive ? 'text-[#0000B3]' : 'text-[#cbd5e1] group-hover:text-[#f1f5f9]'} />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
          {badge}
        </span>
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
  const status = shipmentStatus ? statusColors[shipmentStatus] ?? { dot: 'bg-slate-400', text: shipmentStatus } : null;

  return (
    <aside
      className="flex h-screen flex-col bg-[#0f172a]"
      style={{ width: 260, minWidth: 260 }}
    >
      {/* Logo / Product Name */}
      <div className="flex items-center gap-2.5 border-b border-[#1e293b] px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0000B3]">
          <FileCheck size={16} className="text-white" />
        </div>
        <span className="text-base font-semibold text-white tracking-tight">
          DocHandoff
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col px-3 pt-2">
        {/* Portfolio section */}
        <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
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

        {/* Divider */}
        <div className="mx-1 my-2 border-t border-[#1e293b]" />

        {/* Shipment section */}
        <p className="px-3 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
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
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Shipment Context Panel */}
      {shipmentId && (
        <div className="mx-3 mb-3 rounded-lg bg-[#1e293b] p-3 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Active Shipment
          </p>
          <p className="text-sm font-mono font-semibold text-white">{shipmentId}</p>
          {status && (
            <div className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full', status.dot)} />
              <span className="text-xs text-slate-300">{status.text}</span>
            </div>
          )}
          {cutoffHours != null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cutoff</span>
              <span className={cn('font-medium', cutoffHours < 8 ? 'text-red-400' : 'text-white')}>
                {cutoffHours}h remaining
              </span>
            </div>
          )}
          {readinessPercent != null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Readiness</span>
                <span className={cn('font-medium', readinessPercent >= 100 ? 'text-green-400' : 'text-white')}>
                  {readinessPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#0f172a]">
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    readinessPercent >= 100
                      ? 'bg-green-500'
                      : readinessPercent >= 70
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  )}
                  style={{ width: `${Math.min(readinessPercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[#1e293b] px-4 py-3">
        <p className="text-[11px] text-slate-500">
          Doc Exception Manager · v1.0
        </p>
      </div>
    </aside>
  );
}
