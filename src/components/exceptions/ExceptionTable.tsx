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
    classes: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  },
  mismatch: {
    label: 'Mismatch',
    classes: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20',
  },
  quality: {
    label: 'Quality',
    classes: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  },
  'cutoff-risk': {
    label: 'Cutoff Risk',
    classes: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  },
};

export function ExceptionTable({
  exceptions,
  selectedId,
  onSelect,
}: ExceptionTableProps) {
  if (exceptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
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
          <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Document</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Blocking</th>
            <th className="px-4 py-3 text-right">Action</th>
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
                  'cursor-pointer border-b border-neutral-800/50 transition-colors hover:bg-neutral-800/30',
                  isSelected && 'border-l-2 border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10'
                )}
              >
                {/* Severity */}
                <td className="px-4 py-3">
                  <SeverityBadge severity={exc.severity} />
                </td>

                {/* ID */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-neutral-400">{exc.id}</span>
                </td>

                {/* Type chip */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium',
                      typeChip.classes
                    )}
                  >
                    {typeChip.label}
                  </span>
                </td>

                {/* Document name */}
                <td className="max-w-[180px] truncate px-4 py-3 text-white font-medium">
                  {exc.documentName}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={exc.status} />
                </td>

                {/* Owner */}
                <td className="px-4 py-3 text-neutral-400">{exc.owner}</td>

                {/* Age */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      ageOverSla ? 'text-red-400' : 'text-neutral-400'
                    )}
                  >
                    {Math.round(exc.ageHours)}h
                  </span>
                </td>

                {/* Due */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      dueCritical ? 'font-bold text-red-400' : 'text-neutral-400'
                    )}
                  >
                    {formatCountdown(exc.dueInHours)}
                  </span>
                </td>

                {/* Blocking */}
                <td className="px-4 py-3">
                  {exc.blocking ? (
                    <span className="text-xs font-semibold text-red-400">Yes</span>
                  ) : (
                    <span className="text-xs text-neutral-600">No</span>
                  )}
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(exc.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
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
