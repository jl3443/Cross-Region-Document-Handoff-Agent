import { FileText, CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react';
import type { MatchingSummary } from '@/data/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MatchingSummaryCardProps {
  summary: MatchingSummary;
}

export function MatchingSummaryCard({ summary }: MatchingSummaryCardProps) {
  const stats = [
    {
      label: 'Documents Received',
      value: `${summary.received} / ${summary.totalRequired}`,
      icon: FileText,
      valueClass: 'text-slate-900',
    },
    {
      label: 'Successfully Matched',
      value: summary.matched,
      icon: CheckCircle2,
      valueClass: 'text-green-600',
    },
    {
      label: 'Exceptions Detected',
      value: summary.exceptionsDetected,
      icon: AlertTriangle,
      valueClass: summary.exceptionsDetected > 0 ? 'text-amber-600' : 'text-slate-900',
    },
    {
      label: 'Blocking Issues',
      value: summary.blockingIssues,
      icon: XOctagon,
      valueClass: summary.blockingIssues > 0 ? 'text-red-600' : 'text-slate-900',
    },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Matching Summary</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, valueClass }) => (
            <div key={label} className="flex items-start gap-3 rounded-md bg-slate-50 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <Icon size={16} className="text-slate-400" />
              </div>
              <div>
                <p className={cn('text-lg font-semibold leading-tight', valueClass)}>{value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Matching completed using shipment, PO, and document references.
        </p>
      </CardContent>
    </Card>
  );
}
