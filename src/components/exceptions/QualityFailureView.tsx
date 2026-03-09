import { XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QualityFailureViewProps {
  ocrConfidence?: number;
  issues: string[];
}

function getConfidenceColor(confidence: number): {
  bar: string;
  text: string;
  bg: string;
} {
  if (confidence < 50) {
    return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-100' };
  }
  if (confidence < 75) {
    return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-100' };
  }
  return { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-100' };
}

export function QualityFailureView({
  ocrConfidence,
  issues,
}: QualityFailureViewProps) {
  return (
    <div className="space-y-4">
      {/* OCR Confidence Bar */}
      {ocrConfidence !== undefined && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              OCR Confidence
            </span>
            <span
              className={cn(
                'text-xs font-semibold',
                getConfidenceColor(ocrConfidence).text
              )}
            >
              {ocrConfidence}%
            </span>
          </div>
          <div
            className={cn(
              'h-2.5 w-full overflow-hidden rounded-full',
              getConfidenceColor(ocrConfidence).bg
            )}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all',
                getConfidenceColor(ocrConfidence).bar
              )}
              style={{ width: `${Math.min(ocrConfidence, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Quality Issues List */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-600">
            Quality Issues
          </span>
          <ul className="space-y-1.5">
            {issues.map((issue, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-md border border-red-100 bg-red-50/60 px-3 py-2"
              >
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <span className="text-xs leading-relaxed text-red-800">
                  {issue}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
