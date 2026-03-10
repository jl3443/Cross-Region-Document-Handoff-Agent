import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Loader2,
  Clock,
  DollarSign,
  Zap,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  User,
} from 'lucide-react';

export interface ActionOption {
  id: string;
  priority: 'recommended' | 'alternative' | 'fallback';
  label: string;
  description: string;
  successProbability: number;
  resolveTime: string;
  delay: string;
  cost: string;
}

export interface AiReasoning {
  triggerSummary: string;
  attemptsMade: { time: string; action: string; outcome: string }[];
  whyHuman: string;
  riskFactors: { label: string; level: 'critical' | 'high' | 'medium'; detail: string }[];
}

// Keep RoutingOption as alias for backward compatibility
export type RoutingOption = ActionOption;

const ACTION_OPTIONS: ActionOption[] = [
  {
    id: 'emergency-isf',
    priority: 'recommended',
    label: 'Emergency ISF Filing via Flexport',
    description: 'Activate pre-authorized Flexport emergency brokerage — file ISF immediately without manual intervention.',
    successProbability: 92,
    resolveTime: '~45 min',
    delay: 'None',
    cost: '+$1,200 emergency fee',
  },
  {
    id: 'maersk-extension',
    priority: 'alternative',
    label: 'Request 2-Hour Maersk Cutoff Extension',
    description: 'Contact Maersk Shanghai booking desk directly to negotiate a 2-hour vessel departure delay.',
    successProbability: 67,
    resolveTime: '~30 min',
    delay: 'None (if approved)',
    cost: 'No additional cost',
  },
  {
    id: 'next-sailing',
    priority: 'fallback',
    label: 'Roll to Next Sailing (March 22)',
    description: 'Rebook on next Maersk departure from CNSHA. Eliminates CBP hold risk entirely at cost of 1-day delay.',
    successProbability: 100,
    resolveTime: 'Next day',
    delay: '+24 hours',
    cost: '+$12,000 (rebooking + storage)',
  },
];

const priorityConfig: Record<
  ActionOption['priority'],
  { label: string; bg: string; text: string; border: string; selectedBg: string; selectedBorder: string }
> = {
  recommended: {
    label: 'RECOMMENDED',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    selectedBg: 'bg-green-50',
    selectedBorder: 'border-green-500 ring-1 ring-green-300',
  },
  alternative: {
    label: 'ALTERNATIVE',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    selectedBg: 'bg-blue-50',
    selectedBorder: 'border-blue-500 ring-1 ring-blue-300',
  },
  fallback: {
    label: 'FALLBACK',
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    selectedBg: 'bg-slate-50',
    selectedBorder: 'border-slate-400 ring-1 ring-slate-300',
  },
};

const LOADING_STEPS = [
  'Scanning exception timeline & severity matrix...',
  'Evaluating resolution pathways...',
  'Scoring risk vs. cost tradeoffs...',
  'Generating recommended action plan...',
];

interface EscalationModalProps {
  shipmentId: string;
  aiReasoning?: AiReasoning;
  onClose: () => void;
  onApprove: (option: ActionOption) => void;
}

export function EscalationModal({
  shipmentId,
  aiReasoning,
  onClose,
  onApprove,
}: EscalationModalProps) {
  const [phase, setPhase] = useState<'loading' | 'decision' | 'executing'>('loading');
  const [loadingStep, setLoadingStep] = useState(0);
  const [selected, setSelected] = useState<string>('emergency-isf');

  useEffect(() => {
    const timers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setLoadingStep(i + 1), (i + 1) * 420)
    );
    const finalTimer = setTimeout(() => setPhase('decision'), LOADING_STEPS.length * 420 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, []);

  const handleApprove = () => {
    const option = ACTION_OPTIONS.find((o) => o.id === selected);
    if (!option) return;
    setPhase('executing');
    setTimeout(() => onApprove(option), 700);
  };

  // Build compact risk chips from aiReasoning
  const riskChips = aiReasoning?.riskFactors
    .filter((rf) => rf.level === 'critical')
    .map((rf) => rf.label) ?? ['ISF not filed', 'BOL version conflict'];

  const hoursLeft = aiReasoning?.triggerSummary.match(/(\d+)h to vessel/)?.[1] ?? '4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-700">
                War Room — Human Approval Required
              </h2>
              <p className="mt-0.5 font-mono text-xs text-slate-500">{shipmentId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[72vh] overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ── LOADING PHASE ── */}
            {phase === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="px-6 py-8 space-y-6"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-40" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                      <Sparkles size={24} className="text-amber-600 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">AI Analyzing Risk Profile</p>
                    <p className="mt-0.5 text-xs text-slate-500">Building action recommendation plan…</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {LOADING_STEPS.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={loadingStep > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5"
                    >
                      {loadingStep > i + 1 ? (
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                      ) : loadingStep === i + 1 ? (
                        <Loader2 size={14} className="text-amber-600 shrink-0 animate-spin" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className="text-xs text-amber-800">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── DECISION PHASE ── */}
            {phase === 'decision' && (
              <motion.div
                key="decision"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-4 space-y-4"
              >
                {/* Risk Snapshot */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldAlert size={13} className="text-red-600 shrink-0" />
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">
                      Risk Snapshot
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                      <Clock size={11} />
                      {hoursLeft}h to vessel cutoff
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                      <DollarSign size={11} />
                      $85,200 revenue at risk
                    </span>
                  </div>
                  {riskChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {riskChips.map((chip, i) => (
                        <span key={i} className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Action Cards */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles size={12} className="text-indigo-500" />
                    <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                      AI Recommended Actions — Select one to approve
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {ACTION_OPTIONS.map((option, idx) => {
                      const cfg = priorityConfig[option.priority];
                      const isSelected = selected === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.25 }}
                          onClick={() => setSelected(option.id)}
                          className={`w-full text-left rounded-lg border p-3.5 transition-all duration-150 ${
                            isSelected
                              ? `${cfg.selectedBg} ${cfg.selectedBorder}`
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio */}
                            <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? `border-${option.priority === 'recommended' ? 'green' : option.priority === 'alternative' ? 'blue' : 'slate'}-500` : 'border-slate-300'
                            }`}>
                              {isSelected && (
                                <div className={`h-2 w-2 rounded-full ${
                                  option.priority === 'recommended' ? 'bg-green-500' :
                                  option.priority === 'alternative' ? 'bg-blue-500' : 'bg-slate-500'
                                }`} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Priority badge + label */}
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${cfg.bg} ${cfg.text}`}>
                                  {cfg.label}
                                </span>
                              </div>
                              <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                                {option.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {option.description}
                              </p>

                              {/* Impact chips */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                  option.successProbability >= 90 ? 'bg-green-100 text-green-700' :
                                  option.successProbability >= 70 ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  <TrendingUp size={9} />
                                  {option.successProbability}% success
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                  <Clock size={9} />
                                  {option.resolveTime}
                                </span>
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${
                                  option.cost === 'No additional cost' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  <DollarSign size={9} />
                                  {option.cost}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Approver block */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 shrink-0">
                    <User size={12} className="text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700">Approving as: Operations Manager</p>
                    <p className="text-[10px] text-slate-500">Full escalation authority · Decision logged to audit trail</p>
                  </div>
                  <Zap size={13} className="text-amber-500 shrink-0 ml-auto" />
                </motion.div>
              </motion.div>
            )}

            {/* ── EXECUTING PHASE ── */}
            {phase === 'executing' && (
              <motion.div
                key="executing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 py-12 flex flex-col items-center gap-4 text-center"
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-50" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Zap size={26} className="text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Executing Approved Action</p>
                  <p className="mt-1 text-xs text-slate-500">Notifying stakeholders and resolving exceptions…</p>
                </div>
                <Loader2 size={18} className="text-green-500 animate-spin" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={phase !== 'decision' || !selected}
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            Approve Action
            <ChevronRight size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
