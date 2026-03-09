import { Sparkles, AlertTriangle, TrendingUp, FileWarning, ArrowRightLeft } from 'lucide-react';
import { aiInsight } from '../../data/dashboard-data';

const insightChips = [
  { label: '3 Shipments Need Action', icon: AlertTriangle, color: 'bg-red-500/20 text-red-300 ring-red-400/20' },
  { label: 'Match Rate +1.2%', icon: TrendingUp, color: 'bg-green-500/20 text-green-300 ring-green-400/20' },
  { label: 'ISF Escalation Pending', icon: FileWarning, color: 'bg-amber-500/20 text-amber-300 ring-amber-400/20' },
  { label: 'Handoff 87.5% On-Time', icon: ArrowRightLeft, color: 'bg-blue-500/20 text-blue-300 ring-blue-400/20' },
];

export function AiInsightsCard() {
  return (
    <div className="rounded-xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-4 py-3 shadow-lg ring-1 ring-white/5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0000B3]/30 ring-1 ring-blue-400/20">
          <Sparkles size={16} className="text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{aiInsight.title}</h3>
            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400 ring-1 ring-blue-400/20">
              AI-Powered
            </span>
            <span className="ml-auto text-[11px] text-slate-500">{aiInsight.timestamp}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            {aiInsight.text}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {insightChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <span
                  key={chip.label}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${chip.color}`}
                >
                  <Icon size={10} />
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
