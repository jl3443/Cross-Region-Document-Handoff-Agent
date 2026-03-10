import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Users,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  MailCheck,
  Loader2,
  Send,
} from 'lucide-react';
import type { DocumentException, ResolutionAction, TimelineEvent } from '@/data/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SeverityBadge } from './SeverityBadge';
import { ComparisonView } from './ComparisonView';
import { QualityFailureView } from './QualityFailureView';

interface ExceptionDetailPanelProps {
  exception: DocumentException | null;
  onClose: () => void;
  onAction: (actionId: string) => void;
  onResolve: () => void;
  executedActionIds?: Set<string>;
  onExecuteAll?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Action card icon + color mapping                                   */
/* ------------------------------------------------------------------ */
export const actionConfig: Record<
  ResolutionAction['type'],
  { icon: React.ElementType; accent: string; bg: string; border: string; btnBg: string; btnText: string }
> = {
  email: {
    icon: Mail,
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    btnText: 'text-white',
  },
  internal: {
    icon: Users,
    accent: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    btnBg: 'bg-slate-600 hover:bg-slate-700',
    btnText: 'text-white',
  },
  escalation: {
    icon: AlertTriangle,
    accent: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    btnBg: 'bg-red-600 hover:bg-red-700',
    btnText: 'text-white',
  },
  override: {
    icon: ShieldCheck,
    accent: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    btnText: 'text-white',
  },
};

/* ------------------------------------------------------------------ */
/*  Mini timeline (inline version for panel)                           */
/* ------------------------------------------------------------------ */
const dotColors: Record<TimelineEvent['type'], string> = {
  system: 'bg-[#0000B3]',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  positive: 'bg-green-500',
  info: 'bg-slate-400',
};

function formatTimestamp(raw: string): string {
  try {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch {
    // fall through
  }
  return raw;
}

function MiniTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id} className="relative flex gap-3 px-1 py-1">
            {/* Timestamp */}
            <span className="w-16 shrink-0 text-right text-[11px] text-slate-400">
              {formatTimestamp(event.timestamp)}
            </span>

            {/* Dot + line */}
            <div className="relative flex flex-col items-center">
              <div
                className={cn('z-10 h-2.5 w-2.5 shrink-0 rounded-full', dotColors[event.type])}
              />
              {!isLast && (
                <div className="w-px flex-1 bg-slate-200" style={{ minHeight: 18 }} />
              )}
            </div>

            {/* Description */}
            <p className="flex-1 pb-3 text-xs leading-snug text-slate-600">
              {event.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading helper                                             */
/* ------------------------------------------------------------------ */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </h4>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Panel                                                         */
/* ------------------------------------------------------------------ */
export function ExceptionDetailPanel({
  exception,
  onClose,
  onAction,
  onResolve,
  executedActionIds,
  onExecuteAll,
}: ExceptionDetailPanelProps) {
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  if (!exception) return null;

  const unexecutedActions = exception.resolutionActions.filter(
    (a) => !executedActionIds?.has(a.id)
  );
  const allExecuted = exception.resolutionActions.length > 0 && unexecutedActions.length === 0;

  const handleSendAll = () => {
    setSendingAll(true);
    setTimeout(() => {
      setSendingAll(false);
      onExecuteAll?.();
    }, 1500);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[480px] flex-col border-l border-slate-200 bg-white shadow-xl"
          >
            {/* ---- A. Header ---- */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-slate-800">
                  {exception.id}
                </span>
                <SeverityBadge severity={exception.severity} />
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ---- Scrollable content ---- */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {/* ---- B. What Happened ---- */}
              <section>
                <SectionHeading>What Happened</SectionHeading>
                <p className="text-sm leading-relaxed text-slate-700 mt-3">
                  {exception.summary}
                </p>
                {exception.impact && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exception.impact.split(',').map((tag) => (
                      <Badge key={tag.trim()} variant="warning" className="text-[11px]">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </section>

              {/* ---- C. Why It Matters (AI Assessment) ---- */}
              <section>
                <SectionHeading>Why It Matters</SectionHeading>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 mt-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                      AI Assessment
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {exception.aiAssessment}
                  </p>
                </div>
              </section>

              {/* ---- D. Evidence (conditional) ---- */}
              {(exception.comparisonFields || exception.qualityIssues) && (
                <section>
                  <SectionHeading>Evidence</SectionHeading>

                  {exception.comparisonFields && (
                    <div className="mt-3">
                      <ComparisonView fields={exception.comparisonFields} />
                    </div>
                  )}

                  {exception.qualityIssues && (
                    <div className={exception.comparisonFields ? 'mt-4' : 'mt-3'}>
                      <QualityFailureView
                        ocrConfidence={exception.ocrConfidence}
                        issues={exception.qualityIssues}
                      />
                    </div>
                  )}
                </section>
              )}

              {/* ---- E. Recommended Actions ---- */}
              {exception.resolutionActions.length > 0 && (
                <section>
                  {/* Section header with Send All button */}
                  <div className="flex items-center justify-between mb-3">
                    <SectionHeading>Recommended Actions</SectionHeading>
                    {onExecuteAll && !allExecuted && (
                      <button
                        onClick={handleSendAll}
                        disabled={sendingAll}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                          'bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed'
                        )}
                      >
                        {sendingAll ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Dispatching…
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            Send All
                          </>
                        )}
                      </button>
                    )}
                    {allExecuted && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                        <MailCheck className="h-3.5 w-3.5" />
                        All dispatched
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {exception.resolutionActions.map((action) => {
                      const cfg = actionConfig[action.type];
                      const Icon = cfg.icon;
                      const isExecuted = executedActionIds?.has(action.id) ?? false;

                      return (
                        <div
                          key={action.id}
                          className={cn(
                            'rounded-lg border p-4 transition-all duration-200',
                            cfg.border,
                            isExecuted ? 'bg-green-50/60 border-green-200' : cfg.bg
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                                  isExecuted ? 'bg-green-100' : cfg.bg
                                )}
                              >
                                {isExecuted ? (
                                  <MailCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Icon className={cn('h-4 w-4', cfg.accent)} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={cn('text-sm font-medium', isExecuted ? 'text-green-800' : 'text-slate-800')}>
                                  {action.label}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                  {action.description}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  Target: {action.target}
                                </p>
                              </div>
                            </div>

                            {/* Execute / Sent indicator */}
                            {isExecuted ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700">
                                <MailCheck className="h-3.5 w-3.5" />
                                Sent
                              </span>
                            ) : (
                              <button
                                onClick={() => onAction(action.id)}
                                className={cn(
                                  'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                  cfg.btnBg,
                                  cfg.btnText
                                )}
                              >
                                Execute
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* All-dispatched summary */}
                  {allExecuted && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-green-800">All actions dispatched</p>
                        <p className="text-[11px] text-green-700 mt-0.5">
                          Awaiting document confirmation — status will update when system receipt is confirmed.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </section>
              )}

              {/* ---- F. Resolution History ---- */}
              {exception.timeline.length > 0 && (
                <section>
                  <SectionHeading>Resolution History</SectionHeading>
                  <Card className="p-0 mt-3">
                    <div className="py-2">
                      <MiniTimeline events={exception.timeline} />
                    </div>
                  </Card>
                </section>
              )}
            </div>

            {/* ---- G. Footer ---- */}
            <div className="relative border-t border-slate-200">
              {/* AI Resolve Confirmation overlay */}
              <AnimatePresence>
                {showResolveConfirm && (
                  <motion.div
                    key="resolve-confirm"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-x-0 bottom-full border-t border-green-200 bg-green-50 px-5 py-4"
                  >
                    <div className="mb-3 flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">
                          Confirm Resolution
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-green-700">
                          This will mark{' '}
                          <span className="font-medium">{exception.id}</span> as resolved
                          and update the status across all systems — exception table,
                          readiness score, and gate check.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowResolveConfirm(false)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowResolveConfirm(false);
                          onResolve();
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Yes, Resolve
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 px-5 py-3">
                <button
                  onClick={() => setShowResolveConfirm(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Resolved
                </button>
                <button
                  onClick={() => {
                    const escalation = exception.resolutionActions.find(
                      (a) => a.type === 'escalation'
                    );
                    if (escalation) {
                      onAction(escalation.id);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Escalate
                </button>
              </div>
            </div>
      </motion.aside>
    </>
  );
}
