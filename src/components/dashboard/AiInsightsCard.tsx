import { Sparkles, AlertTriangle, TrendingUp, FileWarning, ArrowRightLeft } from 'lucide-react';
import { aiInsight } from '../../data/dashboard-data';

const insightChips = [
  { label: '3 Shipments Need Action', icon: AlertTriangle, color: 'bg-red-500/10 text-red-400 ring-red-500/20' },
  { label: 'Match Rate +1.2%', icon: TrendingUp, color: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
  { label: 'ISF Escalation Pending', icon: FileWarning, color: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  { label: 'Handoff 87.5% On-Time', icon: ArrowRightLeft, color: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' },
];

export function AiInsightsCard() {
  return (
    <div className="rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-blue-950/30 border border-neutral-800 px-5 py-4 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
          <Sparkles size={18} className="text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">{aiInsight.title}</h3>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-400 ring-1 ring-blue-500/20 uppercase tracking-wide">
              AI-Powered
            </span>
            <span className="ml-auto text-[11px] text-neutral-500">{aiInsight.timestamp}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">
            {aiInsight.text}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {insightChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <span
                  key={chip.label}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium ring-1 ${chip.color}`}
                >
                  <Icon size={12} />
                  {chip.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
