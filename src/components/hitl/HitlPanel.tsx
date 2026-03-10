import { AlertTriangle, ShieldCheck, FileCheck2, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DocumentException, Scenario } from '@/data/types';

interface HitlPanelProps {
  exceptions: DocumentException[];
  scenario: Scenario;
  tradeSignOff: boolean;
  onEscalate: () => void;
  onComplianceOverride: (exceptionId: string, documentName: string) => void;
  onTradeSignOff: () => void;
}

interface HitlItem {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  detail: string;
  actionLabel: string;
  done: boolean;
  critical: boolean;
  onAction: () => void;
  accentClass: string;
  iconClass: string;
}

export function HitlPanel({
  exceptions,
  scenario,
  tradeSignOff,
  onEscalate,
  onComplianceOverride,
  onTradeSignOff,
}: HitlPanelProps) {
  const openExceptions = exceptions.filter((e) => e.status !== 'resolved');

  // 1. Escalation approvals — cutoff-risk or critical exceptions
  const escalationPending = openExceptions.filter(
    (e) => e.severity === 'critical' && e.blocking
  );

  // 2. Mismatch overrides — mismatch type exceptions needing compliance sign-off
  const mismatchPending = openExceptions.filter((e) => e.type === 'mismatch');
  const firstMismatch = mismatchPending[0];

  // 3. Hazmat final sign-off
  const hazmatSignOffNeeded = !!scenario.hazmat && openExceptions.length === 0 && !tradeSignOff;
  const hazmatSignOffDone   = !!scenario.hazmat && tradeSignOff;

  const items: HitlItem[] = [
    {
      id: 'escalation',
      icon: AlertTriangle,
      title: 'Approve Escalations',
      subtitle: 'AI-flagged cutoff risks',
      detail: escalationPending.length > 0
        ? `${escalationPending.length} critical exception${escalationPending.length > 1 ? 's' : ''} require human approval before auto-escalation`
        : 'No escalations pending',
      actionLabel: 'Review & Escalate',
      done: escalationPending.length === 0,
      critical: escalationPending.length > 0,
      onAction: onEscalate,
      accentClass: escalationPending.length > 0 ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-slate-50/40',
      iconClass: escalationPending.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400',
    },
    {
      id: 'mismatch',
      icon: ShieldCheck,
      title: 'Override Mismatches',
      subtitle: 'Compliance team validates',
      detail: mismatchPending.length > 0
        ? `${mismatchPending.length} value / field mismatch${mismatchPending.length > 1 ? 'es' : ''} AI cannot auto-resolve — compliance review required`
        : 'No mismatches pending override',
      actionLabel: 'Review & Override',
      done: mismatchPending.length === 0,
      critical: false,
      onAction: firstMismatch
        ? () => onComplianceOverride(firstMismatch.id, firstMismatch.documentName)
        : () => {},
      accentClass: mismatchPending.length > 0 ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50/40',
      iconClass: mismatchPending.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400',
    },
    {
      id: 'signoff',
      icon: FileCheck2,
      title: 'Final Sign-off',
      subtitle: 'Trade compliance — hazmat / DG',
      detail: !scenario.hazmat
        ? 'Not required — no hazardous cargo on this shipment'
        : hazmatSignOffDone
          ? 'DG Class documentation reviewed and approved by trade compliance'
          : hazmatSignOffNeeded
            ? `${scenario.hazmat.dgClass} / UN${scenario.hazmat.unNumber} — MSDS & DG Declaration ready for sign-off`
            : 'Pending — resolve all exceptions before sign-off is available',
      actionLabel: 'Sign Off',
      done: !scenario.hazmat || hazmatSignOffDone,
      critical: false,
      onAction: onTradeSignOff,
      accentClass: hazmatSignOffNeeded
        ? 'border-purple-200 bg-purple-50/40'
        : 'border-slate-200 bg-slate-50/40',
      iconClass: hazmatSignOffDone
        ? 'bg-green-100 text-green-600'
        : hazmatSignOffNeeded
          ? 'bg-purple-100 text-purple-600'
          : 'bg-slate-100 text-slate-400',
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Human in the Loop
        </span>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          HITL
        </span>
      </div>

      {/* Items */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        {items.map((item) => {
          const Icon = item.icon;
          const canAct = !item.done && (
            item.id === 'escalation' ? escalationPending.length > 0 :
            item.id === 'mismatch'   ? mismatchPending.length > 0 :
            hazmatSignOffNeeded
          );

          return (
            <div key={item.id} className={cn('p-3 flex flex-col gap-2', item.accentClass)}>
              {/* Icon + title */}
              <div className="flex items-start gap-2.5">
                <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', item.iconClass)}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{item.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</p>
                </div>
                {item.done && (
                  <CheckCircle2 size={14} className="ml-auto shrink-0 text-green-500" />
                )}
                {!item.done && item.critical && (
                  <span className="ml-auto shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                    <span className="text-[8px] font-bold text-white">{escalationPending.length}</span>
                  </span>
                )}
              </div>

              {/* Detail text */}
              <p className="text-[10px] text-slate-500 leading-relaxed">{item.detail}</p>

              {/* Action button */}
              {canAct ? (
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'mt-auto h-7 text-[11px] font-semibold w-full',
                    item.id === 'escalation' ? 'border-red-300 text-red-600 hover:bg-red-50' :
                    item.id === 'mismatch'   ? 'border-amber-300 text-amber-700 hover:bg-amber-50' :
                                              'border-purple-300 text-purple-700 hover:bg-purple-50'
                  )}
                  onClick={item.onAction}
                >
                  {item.actionLabel}
                </Button>
              ) : (
                <div className={cn('mt-auto flex items-center gap-1 text-[10px]', item.done ? 'text-green-600' : 'text-slate-400')}>
                  {item.done
                    ? <><CheckCircle2 size={11} /> Complete</>
                    : <><Clock size={11} /> Waiting on exceptions</>
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
