import { CheckCircle2, AlertTriangle, Circle, XCircle, Bell, Flame, Globe } from 'lucide-react';
import type { RequiredDocument, DocStatus, LaneRequirement } from '../../data/types';
import { cn } from '../../lib/utils';

interface RequiredDocsChecklistProps {
  documents: RequiredDocument[];
  laneRequirements?: LaneRequirement;
}

const statusConfig: Record<
  DocStatus,
  { icon: React.ElementType; iconClass: string; label: string }
> = {
  validated: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    label: 'Validated',
  },
  mismatch: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    label: 'Mismatch',
  },
  unreadable: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    label: 'Unreadable',
  },
  pending: {
    icon: Circle,
    iconClass: 'text-neutral-600',
    label: 'Pending',
  },
  missing: {
    icon: XCircle,
    iconClass: 'text-red-500',
    label: 'Missing',
  },
};

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function RequiredDocsChecklist({ documents, laneRequirements }: RequiredDocsChecklistProps) {
  const received = documents.filter(
    (d) => d.status !== 'missing' && d.status !== 'pending'
  ).length;
  const total = documents.length;
  const receivedPct = total > 0 ? (received / total) * 100 : 0;

  // Build segmented data for progress bar
  const segments: { pct: number; color: string }[] = [];
  const validated = documents.filter((d) => d.status === 'validated').length;
  const issues = documents.filter(
    (d) => d.status === 'mismatch' || d.status === 'unreadable'
  ).length;
  const missing = documents.filter((d) => d.status === 'missing').length;
  const pending = documents.filter((d) => d.status === 'pending').length;

  if (validated > 0) segments.push({ pct: (validated / total) * 100, color: 'bg-emerald-500' });
  if (issues > 0) segments.push({ pct: (issues / total) * 100, color: 'bg-amber-500' });
  if (missing > 0) segments.push({ pct: (missing / total) * 100, color: 'bg-red-400' });
  if (pending > 0) segments.push({ pct: (pending / total) * 100, color: 'bg-neutral-700' });

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      {/* Lane requirements context */}
      {laneRequirements && (
        <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-blue-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              Lane Compliance Requirements
            </span>
          </div>
          <p className="text-xs font-medium text-white mb-2">{laneRequirements.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {laneRequirements.regulations.map((reg) => (
              <span
                key={reg}
                className="inline-flex items-center rounded-md bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-medium text-blue-300 ring-1 ring-blue-500/30"
              >
                {reg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Progress summary */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          {received} of {total} documents received
        </span>
        <span className="text-xs text-neutral-500">{Math.round(receivedPct)}%</span>
      </div>

      {/* Segmented progress bar */}
      <div className="mb-4 flex h-2 w-full overflow-hidden rounded-full bg-neutral-800">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn('h-full transition-all', seg.color)}
            style={{ width: `${seg.pct}%` }}
          />
        ))}
      </div>

      {/* Document list */}
      <ul className="space-y-2">
        {documents.map((doc) => {
          const config = statusConfig[doc.status];
          const Icon = config.icon;

          return (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-800/30 px-3 py-2.5 hover:bg-neutral-800/50 transition-colors"
            >
              <Icon size={16} className={cn('shrink-0', config.iconClass)} />

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {doc.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  {doc.source && (
                    <p className="text-[11px] text-neutral-500">{doc.source}</p>
                  )}
                  {doc.dgClassification && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400 ring-1 ring-orange-500/20">
                      <Flame size={10} />
                      {doc.dgClassification}
                    </span>
                  )}
                  {doc.remindersSent != null && doc.remindersSent > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-amber-500/20">
                      <Bell size={9} />
                      {doc.remindersSent} {doc.remindersSent === 1 ? 'reminder' : 'reminders'} sent
                      {doc.lastReminderAt && (
                        <span className="text-amber-500">
                          &middot; {formatShortDate(doc.lastReminderAt)}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    'text-xs font-medium',
                    doc.status === 'validated'
                      ? 'text-emerald-400'
                      : doc.status === 'missing'
                        ? 'text-red-400'
                        : doc.status === 'pending'
                          ? 'text-neutral-500'
                          : 'text-amber-400'
                  )}
                >
                  {config.label}
                </span>
                {doc.receivedAt && (
                  <span className="text-[11px] text-neutral-500">
                    {formatShortDate(doc.receivedAt)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
