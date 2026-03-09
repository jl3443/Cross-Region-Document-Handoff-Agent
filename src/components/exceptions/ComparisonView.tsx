import { Check, X } from 'lucide-react';
import type { ComparisonField } from '../../data/types';
import { cn } from '../../lib/utils';

interface ComparisonViewProps {
  fields: ComparisonField[];
}

export function ComparisonView({ fields }: ComparisonViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2.5">Field</th>
            <th className="px-4 py-2.5">Document Value</th>
            <th className="px-4 py-2.5">System Reference</th>
            <th className="px-4 py-2.5 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, idx) => {
            const isMatch = field.match;
            return (
              <tr
                key={idx}
                className={cn(
                  'border-b border-slate-100 last:border-b-0',
                  isMatch
                    ? 'border-l-2 border-l-green-400 bg-green-50/50'
                    : 'border-l-2 border-l-red-400 bg-red-50/50'
                )}
              >
                {/* Field name */}
                <td className="px-4 py-2.5 text-xs font-medium text-slate-600">
                  {field.field}
                </td>

                {/* Document value */}
                <td
                  className={cn(
                    'px-4 py-2.5 text-xs',
                    !isMatch ? 'font-semibold text-red-700' : 'text-slate-700'
                  )}
                >
                  {field.documentValue}
                </td>

                {/* System reference */}
                <td
                  className={cn(
                    'px-4 py-2.5 text-xs',
                    !isMatch ? 'font-semibold text-red-700' : 'text-slate-700'
                  )}
                >
                  {field.systemValue}
                </td>

                {/* Status icon */}
                <td className="px-4 py-2.5 text-center">
                  {isMatch ? (
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-100 p-1">
                      <X className="h-3.5 w-3.5 text-red-600" />
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
