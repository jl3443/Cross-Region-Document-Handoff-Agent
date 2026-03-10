import { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Ship,
  AlertTriangle,
  FileText,
  Mail,
  Clock,
  FileCheck,
  ChevronDown,
  Inbox,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { ViewId, UserRole } from '@/data/types';

const ROLE_DISPLAY: Record<UserRole, { label: string; color: string; bg: string }> = {
  'export-coordinator': { label: 'Export Coordinator', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  'import-team': { label: 'Import Team', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  'broker': { label: 'Broker', color: 'text-violet-400', bg: 'bg-violet-500/15' },
  'trade-compliance': { label: 'Trade Compliance', color: 'text-amber-400', bg: 'bg-amber-500/15' },
};

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  exceptionCount: number;
  shipmentId?: string;
  shipmentStatus?: string;
  cutoffHours?: number;
  readinessPercent?: number;
  inboxHasReply?: number;
  emailSubView?: 'inbox' | 'sent';
  onEmailSubViewChange?: (v: 'inbox' | 'sent') => void;
  userRole?: UserRole;
  onLogout?: () => void;
}

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
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon
        size={16}
        className={cn(
          'shrink-0',
          isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'
        )}
      />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function SubNavButton({
  id,
  label,
  icon: Icon,
  isActive,
  badge,
  hasDot,
  onClick,
}: {
  id: string;
  label: string;
  icon?: React.ElementType;
  isActive: boolean;
  badge?: number;
  hasDot?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
      )}
    >
      {Icon && (
        <Icon
          size={13}
          className={cn(
            'shrink-0',
            isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground'
          )}
        />
      )}
      <span className="flex-1 text-left truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
      {hasDot && (
        <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-500/20 shrink-0" />
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
  inboxHasReply,
  emailSubView = 'inbox',
  onEmailSubViewChange,
  userRole,
  onLogout,
}: SidebarProps) {
  const [isShipmentExpanded, setIsShipmentExpanded] = useState(true);
  const [isEmailExpanded, setIsEmailExpanded] = useState(true);

  const getCutoffColor = () => {
    if (!cutoffHours) return 'text-sidebar-foreground';
    if (cutoffHours <= 4) return 'text-red-400';
    if (cutoffHours <= 12) return 'text-amber-400';
    return 'text-green-400';
  };

  const statusConfig: Record<string, { dot: string; label: string }> = {
    'on-track': { dot: 'bg-green-500', label: 'On Track' },
    'at-risk': { dot: 'bg-amber-500', label: 'At Risk' },
    blocked: { dot: 'bg-red-500', label: 'Blocked' },
  };
  const status = shipmentStatus ? statusConfig[shipmentStatus] ?? { dot: 'bg-slate-400', label: shipmentStatus } : null;

  const isShipmentSubView =
    activeView === 'exceptions' ||
    activeView === 'documents' ||
    activeView === 'communications' ||
    activeView === 'timeline';

  return (
    <aside
      className="flex h-screen flex-col bg-sidebar"
      style={{ width: 248, minWidth: 248 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <FileCheck size={14} className="text-primary-foreground" />
        </div>
        <span className="text-[9px] font-semibold text-sidebar-accent-foreground tracking-tight leading-snug">
          Operations Readiness Manager
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col px-2 pt-2 flex-1 overflow-y-auto">
        {/* Portfolio section */}
        <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          Portfolio
        </p>
        <div className="space-y-0.5">
          <NavButton id="dashboard" label="Dashboard" icon={BarChart3} isActive={activeView === 'dashboard'} onClick={() => onViewChange('dashboard')} />
          <NavButton id="analytics" label="Analytics" icon={PieChart} isActive={activeView === 'analytics'} onClick={() => onViewChange('analytics')} />
        </div>

        <Separator className="mx-1 my-2 bg-sidebar-border" />

        {/* Workspace — Shipment Overview + Email as peer-level items */}
        <div className="space-y-0.5">

          {/* Shipment Overview row — parent with inline chevron */}
          <button
            onClick={() => {
              onViewChange('overview');
              setIsShipmentExpanded(true);
            }}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeView === 'overview' || isShipmentSubView
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <Ship
              size={16}
              className={cn(
                'shrink-0',
                activeView === 'overview' || isShipmentSubView
                  ? 'text-sidebar-primary'
                  : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'
              )}
            />
            <span className="flex-1 text-left truncate">Shipment Overview</span>
            {/* Inline chevron — no border/background, just an icon */}
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                setIsShipmentExpanded((v) => !v);
              }}
              className="flex items-center justify-center h-4 w-4 shrink-0"
              aria-label="Toggle sub-menu"
            >
              <ChevronDown
                size={13}
                className={cn(
                  'transition-transform duration-200',
                  activeView === 'overview' || isShipmentSubView
                    ? 'text-sidebar-accent-foreground/60'
                    : 'text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground/60',
                  isShipmentExpanded ? 'rotate-0' : '-rotate-90'
                )}
              />
            </span>
          </button>

          {/* Sub-items */}
          {isShipmentExpanded && (
            <div className="ml-4 pl-2 border-l-2 border-sidebar-border space-y-0.5 mt-0.5 mb-1">
              <SubNavButton id="exceptions" label="Exceptions" icon={AlertTriangle} isActive={activeView === 'exceptions'} badge={exceptionCount} onClick={() => onViewChange('exceptions')} />
              <SubNavButton id="documents" label="Documents" icon={FileText} isActive={activeView === 'documents'} onClick={() => onViewChange('documents')} />
              <SubNavButton id="communications" label="Communications" icon={Mail} isActive={activeView === 'communications'} onClick={() => onViewChange('communications')} />
              <SubNavButton id="timeline" label="Timeline" icon={Clock} isActive={activeView === 'timeline'} onClick={() => onViewChange('timeline')} />
            </div>
          )}

          {/* Email — same level as Shipment Overview */}
          <button
            onClick={() => {
              onViewChange('email');
              onEmailSubViewChange?.('inbox');
              setIsEmailExpanded(true);
            }}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeView === 'email'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <Mail
              size={16}
              className={cn(
                'shrink-0',
                activeView === 'email' ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'
              )}
            />
            <span className="flex-1 text-left truncate">Email</span>
            {inboxHasReply > 0 && activeView !== 'email' && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                {inboxHasReply}
              </span>
            )}
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                setIsEmailExpanded((v) => !v);
              }}
              className="flex items-center justify-center h-4 w-4 shrink-0"
              aria-label="Toggle email sub-menu"
            >
              <ChevronDown
                size={13}
                className={cn(
                  'transition-transform duration-200',
                  activeView === 'email'
                    ? 'text-sidebar-accent-foreground/60'
                    : 'text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground/60',
                  isEmailExpanded ? 'rotate-0' : '-rotate-90'
                )}
              />
            </span>
          </button>

          {/* Email sub-items */}
          {isEmailExpanded && (
            <div className="ml-4 pl-2 border-l-2 border-sidebar-border space-y-0.5 mt-0.5 mb-1">
              <SubNavButton
                id="email-inbox"
                label="Inbox"
                icon={Inbox}
                isActive={activeView === 'email' && emailSubView === 'inbox'}
                badge={inboxHasReply > 0 ? inboxHasReply : undefined}
                onClick={() => {
                  onViewChange('email');
                  onEmailSubViewChange?.('inbox');
                }}
              />
              <SubNavButton
                id="email-sent"
                label="Sent"
                icon={Send}
                isActive={activeView === 'email' && emailSubView === 'sent'}
                onClick={() => {
                  onViewChange('email');
                  onEmailSubViewChange?.('sent');
                }}
              />
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />
      </nav>

      {/* Active Shipment Context — only when on shipment views */}
      {shipmentId && (activeView === 'overview' || isShipmentSubView) && (
        <div className="mx-2 mb-2 rounded-lg bg-sidebar-accent p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            Active Shipment
          </p>
          <p className="font-mono text-sm font-bold text-sidebar-accent-foreground">{shipmentId}</p>
          {status && (
            <div className="flex items-center gap-1.5">
              <div className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
              <span className="text-xs text-sidebar-foreground/80">{status.label}</span>
            </div>
          )}
          {cutoffHours != null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-sidebar-foreground/60">Cutoff</span>
              <span className={cn('font-medium tabular-nums', getCutoffColor())}>
                {cutoffHours}h remaining
              </span>
            </div>
          )}
          {readinessPercent != null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sidebar-foreground/60">Readiness</span>
                <span className={cn(
                  'font-medium tabular-nums',
                  readinessPercent >= 100 ? 'text-green-400' : readinessPercent >= 70 ? 'text-blue-400' : 'text-amber-400'
                )}>
                  {readinessPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-sidebar/80">
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    readinessPercent >= 100 ? 'bg-green-500' : readinessPercent >= 70 ? 'bg-primary' : 'bg-amber-500'
                  )}
                  style={{ width: `${Math.min(readinessPercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer — role badge + logout */}
      <div className="border-t border-sidebar-border px-3 py-2.5 space-y-2">
        {userRole && (
          <div className={cn('flex items-center justify-between rounded-lg px-2.5 py-2', ROLE_DISPLAY[userRole].bg)}>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 leading-none mb-0.5">
                Logged in as
              </p>
              <p className={cn('text-[11px] font-bold truncate', ROLE_DISPLAY[userRole].color)}>
                {ROLE_DISPLAY[userRole].label}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-2 shrink-0 text-[10px] text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors underline underline-offset-2"
              >
                Switch
              </button>
            )}
          </div>
        )}
        <p className="text-[10px] text-sidebar-foreground/30 px-1">
          Operations Readiness Manager · v2.4
        </p>
      </div>
    </aside>
  );
}
