import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Users,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import type { DocumentException, ResolutionAction, TimelineEvent } from '../../data/types';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SeverityBadge } from './SeverityBadge';
import { ComparisonView } from './ComparisonView';
import { QualityFailureView } from './QualityFailureView';

interface ExceptionDetailPanelProps {
  exception: DocumentException | null;
  onClose: () => void;
  onAction: (actionId: string) => void;
  onResolve: () => void;
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
    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
}: ExceptionDetailPanelProps) {
  if (!exception) return null;

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
                <p className="text-sm leading-relaxed text-slate-700">
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
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
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
                    <ComparisonView fields={exception.comparisonFields} />
                  )}

                  {exception.qualityIssues && (
                    <div className={exception.comparisonFields ? 'mt-4' : ''}>
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
                  <SectionHeading>Recommended Actions</SectionHeading>
                  <div className="space-y-3">
                    {exception.resolutionActions.map((action) => {
                      const cfg = actionConfig[action.type];
                      const Icon = cfg.icon;

                      return (
                        <div
                          key={action.id}
                          className={cn(
                            'rounded-lg border p-4',
                            cfg.border,
                            cfg.bg
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                                  cfg.bg
                                )}
                              >
                                <Icon className={cn('h-4 w-4', cfg.accent)} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ---- F. Resolution History ---- */}
              {exception.timeline.length > 0 && (
                <section>
                  <SectionHeading>Resolution History</SectionHeading>
                  <Card className="p-0">
                    <div className="py-2">
                      <MiniTimeline events={exception.timeline} />
                    </div>
                  </Card>
                </section>
              )}
            </div>

            {/* ---- G. Footer ---- */}
            <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-3">
              <button
                onClick={onResolve}
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
      </motion.aside>
    </>
  );
}
