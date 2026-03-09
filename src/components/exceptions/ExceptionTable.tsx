import { Eye, Inbox } from 'lucide-react';
import type { DocumentException, ExceptionType } from '../../data/types';
import { cn, formatCountdown } from '../../lib/utils';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

interface ExceptionTableProps {
  exceptions: DocumentException[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const typeChipConfig: Record<ExceptionType, { label: string; classes: string }> = {
  'missing-doc': {
    label: 'Missing Doc',
    classes: 'bg-blue-100 text-blue-700',
  },
  mismatch: {
    label: 'Mismatch',
    classes: 'bg-orange-100 text-orange-700',
  },
  quality: {
    label: 'Quality',
    classes: 'bg-amber-100 text-amber-700',
  },
  'cutoff-risk': {
    label: 'Cutoff Risk',
    classes: 'bg-red-100 text-red-700',
  },
};

export function ExceptionTable({
  exceptions,
  selectedId,
  onSelect,
}: ExceptionTableProps) {
  if (exceptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Inbox className="mb-3 h-10 w-10" />
        <p className="text-sm font-medium">No exceptions found</p>
        <p className="mt-1 text-xs">All documents are matching as expected.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2.5">Severity</th>
            <th className="px-3 py-2.5">ID</th>
            <th className="px-3 py-2.5">Type</th>
            <th className="px-3 py-2.5">Document</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5">Owner</th>
            <th className="px-3 py-2.5">Age</th>
            <th className="px-3 py-2.5">Due</th>
            <th className="px-3 py-2.5">Blocking</th>
            <th className="px-3 py-2.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {exceptions.map((exc) => {
            const isSelected = exc.id === selectedId;
            const ageOverSla = exc.ageHours > exc.slaHours;
            const dueCritical = exc.dueInHours < 2;
            const typeChip = typeChipConfig[exc.type];

            return (
              <tr
                key={exc.id}
                onClick={() => onSelect(exc.id)}
                className={cn(
                  'cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50',
                  isSelected && 'border-l-2 border-l-blue-500 bg-blue-50 hover:bg-blue-50'
                )}
              >
                {/* Severity */}
                <td className="px-3 py-2.5">
                  <SeverityBadge severity={exc.severity} />
                </td>

                {/* ID */}
                <td className="px-3 py-2.5">
                  <span className="font-mono text-xs text-slate-600">{exc.id}</span>
                </td>

                {/* Type chip */}
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      typeChip.classes
                    )}
                  >
                    {typeChip.label}
                  </span>
                </td>

                {/* Document name */}
                <td className="max-w-[180px] truncate px-3 py-2.5 text-slate-700">
                  {exc.documentName}
                </td>

                {/* Status */}
                <td className="px-3 py-2.5">
                  <StatusBadge status={exc.status} />
                </td>

                {/* Owner */}
                <td className="px-3 py-2.5 text-slate-600">{exc.owner}</td>

                {/* Age */}
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      ageOverSla ? 'text-red-600' : 'text-slate-600'
                    )}
                  >
                    {Math.round(exc.ageHours)}h
                  </span>
                </td>

                {/* Due */}
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      dueCritical ? 'font-bold text-red-600' : 'text-slate-600'
                    )}
                  >
                    {formatCountdown(exc.dueInHours)}
                  </span>
                </td>

                {/* Blocking */}
                <td className="px-3 py-2.5">
                  {exc.blocking ? (
                    <span className="text-xs font-semibold text-red-600">Yes</span>
                  ) : (
                    <span className="text-xs text-slate-400">No</span>
                  )}
                </td>

                {/* Action */}
                <td className="px-3 py-2.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(exc.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
