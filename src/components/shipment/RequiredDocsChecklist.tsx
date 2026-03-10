import { CheckCircle2, AlertTriangle, Circle, XCircle, Bell, Flame, Globe, Database, Server, Mail, Building2 } from 'lucide-react';
import type { RequiredDocument, DocStatus, LaneRequirement } from '../../data/types';
import { cn } from '../../lib/utils';

function getSourceBadge(source: string): { label: string; className: string; Icon: React.ElementType } {
  const s = source.toLowerCase();
  if (s.includes('sap'))             return { label: 'SAP',            className: 'bg-blue-100 text-blue-700',     Icon: Database };
  if (s.includes('otm'))             return { label: 'OTM',            className: 'bg-teal-100 text-teal-700',     Icon: Server };
  if (s.includes('edi'))             return { label: 'EDI',            className: 'bg-violet-100 text-violet-700', Icon: Server };
  if (s.includes('carrier portal'))  return { label: 'Carrier Portal', className: 'bg-sky-100 text-sky-700',       Icon: Building2 };
  if (s.includes('broker portal'))   return { label: 'Broker Portal',  className: 'bg-indigo-100 text-indigo-700', Icon: Building2 };
  if (s.includes('supplier portal')) return { label: 'Supplier Portal', className: 'bg-orange-100 text-orange-700', Icon: Building2 };
  if (s.includes('email'))           return { label: 'Email',          className: 'bg-slate-100 text-slate-600',   Icon: Mail };
  return                                    { label: source,           className: 'bg-slate-100 text-slate-600',   Icon: Globe };
}

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
    iconClass: 'text-green-500',
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
    iconClass: 'text-slate-300',
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

  if (validated > 0) segments.push({ pct: (validated / total) * 100, color: 'bg-green-500' });
  if (issues > 0) segments.push({ pct: (issues / total) * 100, color: 'bg-amber-500' });
  if (missing > 0) segments.push({ pct: (missing / total) * 100, color: 'bg-red-300' });
  if (pending > 0) segments.push({ pct: (pending / total) * 100, color: 'bg-slate-200' });

  return (
    <div>
      {/* Lane requirements context */}
      {laneRequirements && (
        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Globe size={14} className="text-blue-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              Lane Compliance Requirements
            </span>
          </div>
          <p className="text-xs font-medium text-slate-700 mb-1.5">{laneRequirements.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {laneRequirements.regulations.map((reg) => (
              <span
                key={reg}
                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium text-blue-700"
              >
                {reg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Progress summary */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {received} of {total} documents received
        </span>
        <span className="text-xs text-slate-400">{Math.round(receivedPct)}%</span>
      </div>

      {/* Segmented progress bar */}
      <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
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
              className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2"
            >
              <Icon size={16} className={cn('shrink-0', config.iconClass)} />

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">
                  {doc.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  {doc.source && (() => {
                    const badge = getSourceBadge(doc.source!);
                    const BadgeIcon = badge.Icon;
                    return (
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.className)}>
                        <BadgeIcon size={9} />
                        {badge.label}
                      </span>
                    );
                  })()}
                  {doc.dgClassification && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                      <Flame size={10} />
                      {doc.dgClassification}
                    </span>
                  )}
                  {doc.remindersSent != null && doc.remindersSent > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
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
                      ? 'text-green-600'
                      : doc.status === 'missing'
                        ? 'text-red-600'
                        : doc.status === 'pending'
                          ? 'text-slate-400'
                          : 'text-amber-600'
                  )}
                >
                  {config.label}
                </span>
                {doc.receivedAt && (
                  <span className="text-[11px] text-slate-400">
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
