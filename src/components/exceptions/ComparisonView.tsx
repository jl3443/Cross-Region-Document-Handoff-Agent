import { Check, X } from 'lucide-react';
import type { ComparisonField } from '../../data/types';
import { cn } from '../../lib/utils';

interface ComparisonViewProps {
  fields: ComparisonField[];
}

export function ComparisonView({ fields }: ComparisonViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/80">
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Field</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Document Value</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">System Reference</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Match</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, idx) => {
            const isMatch = field.match;
            return (
              <tr
                key={idx}
                className={cn(
                  'border-b border-neutral-800/50 last:border-b-0',
                  isMatch
                    ? 'border-l-2 border-l-emerald-500/60'
                    : 'border-l-2 border-l-red-500/60'
                )}
              >
                <td className="px-4 py-2.5 text-xs font-medium text-neutral-400">
                  {field.field}
                </td>
                <td className={cn('px-4 py-2.5 text-xs', !isMatch ? 'font-semibold text-red-400' : 'text-neutral-300')}>
                  {field.documentValue}
                </td>
                <td className={cn('px-4 py-2.5 text-xs', !isMatch ? 'font-semibold text-red-400' : 'text-neutral-300')}>
                  {field.systemValue}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {isMatch ? (
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 p-1 ring-1 ring-emerald-500/20">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-500/10 p-1 ring-1 ring-red-500/20">
                      <X className="h-3 w-3 text-red-400" />
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
