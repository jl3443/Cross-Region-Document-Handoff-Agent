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
import { SeverityBadge } from './SeverityBadge';
import { ComparisonView } from './ComparisonView';
import { QualityFailureView } from './QualityFailureView';

interface ExceptionDetailPanelProps {
  exception: DocumentException | null;
  onClose: () => void;
  onAction: (actionId: string) => void;
  onResolve: () => void;
}

export const actionConfig: Record<
  ResolutionAction['type'],
  { icon: React.ElementType; accent: string; bg: string; border: string; btnBg: string; btnText: string }
> = {
  email: {
    icon: Mail,
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    btnBg: 'bg-blue-500 hover:bg-blue-600',
    btnText: 'text-white',
  },
  internal: {
    icon: Users,
    accent: 'text-neutral-400',
    bg: 'bg-neutral-500/10',
    border: 'border-neutral-500/20',
    btnBg: 'bg-neutral-600 hover:bg-neutral-500',
    btnText: 'text-white',
  },
  escalation: {
    icon: AlertTriangle,
    accent: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    btnBg: 'bg-red-500 hover:bg-red-600',
    btnText: 'text-white',
  },
  override: {
    icon: ShieldCheck,
    accent: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    btnBg: 'bg-purple-500 hover:bg-purple-600',
    btnText: 'text-white',
  },
};

const dotColors: Record<TimelineEvent['type'], string> = {
  system: 'bg-blue-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  positive: 'bg-emerald-500',
  info: 'bg-neutral-500',
};

function formatTimestamp(raw: string): string {
  try {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  } catch { /* fall through */ }
  return raw;
}

function MiniTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id} className="relative flex gap-3 px-1 py-1">
            <span className="w-14 shrink-0 text-right text-[10px] text-neutral-600">
              {formatTimestamp(event.timestamp)}
            </span>
            <div className="relative flex flex-col items-center">
              <div className={cn('z-10 h-2 w-2 shrink-0 rounded-full mt-1', dotColors[event.type])} />
              {!isLast && <div className="w-px flex-1 bg-neutral-800" style={{ minHeight: 18 }} />}
            </div>
            <p className="flex-1 pb-3 text-xs leading-snug text-neutral-400">{event.description}</p>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
      {children}
    </h4>
  );
}

export function ExceptionDetailPanel({ exception, onClose, onAction, onResolve }: ExceptionDetailPanelProps) {
  if (!exception) return null;

  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.aside
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 flex w-[500px] flex-col border-l border-neutral-800 bg-[#0a0a0a] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-white">{exception.id}</span>
            <SeverityBadge severity={exception.severity} />
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">

          {/* What Happened */}
          <section>
            <SectionHeading>What Happened</SectionHeading>
            <p className="text-sm leading-relaxed text-neutral-300">{exception.summary}</p>
            {exception.impact && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {exception.impact.split(',').map((tag) => (
                  <Badge key={tag.trim()} variant="warning" className="text-[10px]">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* AI Assessment */}
          <section>
            <SectionHeading>Why It Matters</SectionHeading>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  AI Assessment
                </span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-300">{exception.aiAssessment}</p>
            </div>
          </section>

          {/* Evidence */}
          {(exception.comparisonFields || exception.qualityIssues) && (
            <section>
              <SectionHeading>Evidence</SectionHeading>
              {exception.comparisonFields && <ComparisonView fields={exception.comparisonFields} />}
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

          {/* Recommended Actions */}
          {exception.resolutionActions.length > 0 && (
            <section>
              <SectionHeading>Recommended Actions</SectionHeading>
              <div className="space-y-2">
                {exception.resolutionActions.map((action) => {
                  const cfg = actionConfig[action.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={action.id} className={cn('rounded-lg border p-3.5', cfg.border, cfg.bg)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                            <Icon className={cn('h-4 w-4', cfg.accent)} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white">{action.label}</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">{action.description}</p>
                            <p className="mt-1 text-[10px] text-neutral-600">Target: {action.target}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onAction(action.id)}
                          className={cn('shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors', cfg.btnBg, cfg.btnText)}
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

          {/* Resolution History */}
          {exception.timeline.length > 0 && (
            <section>
              <SectionHeading>Resolution History</SectionHeading>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 py-2">
                <MiniTimeline events={exception.timeline} />
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-neutral-800 px-5 py-3.5">
          <button
            onClick={onResolve}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Resolved
          </button>
          <button
            onClick={() => {
              const escalation = exception.resolutionActions.find((a) => a.type === 'escalation');
              if (escalation) onAction(escalation.id);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Escalate
          </button>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            Close
          </button>
        </div>
      </motion.aside>
    </>
  );
}
