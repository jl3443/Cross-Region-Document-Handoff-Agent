import { XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QualityFailureViewProps {
  ocrConfidence?: number;
  issues: string[];
}

function getConfidenceColor(confidence: number) {
  if (confidence < 50) return { bar: 'bg-red-500', text: 'text-red-400', track: 'bg-red-500/10' };
  if (confidence < 75) return { bar: 'bg-amber-500', text: 'text-amber-400', track: 'bg-amber-500/10' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-400', track: 'bg-emerald-500/10' };
}

export function QualityFailureView({ ocrConfidence, issues }: QualityFailureViewProps) {
  return (
    <div className="space-y-4">
      {ocrConfidence !== undefined && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">OCR Confidence</span>
            <span className={cn('text-xs font-semibold tabular-nums', getConfidenceColor(ocrConfidence).text)}>
              {ocrConfidence}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className={cn('h-full rounded-full transition-all', getConfidenceColor(ocrConfidence).bar)}
              style={{ width: `${Math.min(ocrConfidence, 100)}%` }}
            />
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-400">Quality Issues</span>
          <ul className="space-y-1.5">
            {issues.map((issue, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2"
              >
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                <span className="text-xs leading-relaxed text-neutral-300">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
