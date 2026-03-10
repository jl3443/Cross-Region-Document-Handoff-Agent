import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Circle,
  Sparkles,
  XCircle,
  Phone,
  Mail,
  Loader2,
  User,
  ArrowUpRight,
} from 'lucide-react';

export interface EscalationContact {
  name: string;
  role: string;
  phone: string;
  altPhone?: string;
  email: string;
}

interface EscalationAction {
  target: string;
  description: string;
  status: 'pending' | 'sent' | 'confirmed';
  contact?: EscalationContact;
}

export interface AiReasoning {
  triggerSummary: string;
  attemptsMade: { time: string; action: string; outcome: string }[];
  whyHuman: string;
  riskFactors: { label: string; level: 'critical' | 'high' | 'medium'; detail: string }[];
}

interface EscalationModalProps {
  shipmentId: string;
  actions: EscalationAction[];
  onClose: () => void;
  onExecute: () => void;
  aiReasoning?: AiReasoning;
}

const statusConfig: Record<
  EscalationAction['status'],
  { icon: React.ElementType; color: string; label: string }
> = {
  pending: { icon: Circle, color: 'text-slate-400', label: 'Pending' },
  sent: { icon: ArrowUpRight, color: 'text-blue-500', label: 'Sent' },
  confirmed: { icon: CheckCircle, color: 'text-green-500', label: 'Confirmed' },
};

const riskDot: Record<AiReasoning['riskFactors'][number]['level'], string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-slate-400',
};

const riskText: Record<AiReasoning['riskFactors'][number]['level'], string> = {
  critical: 'text-red-700',
  high: 'text-amber-700',
  medium: 'text-slate-600',
};

const LOADING_STEPS = [
  'Scanning exception log & severity matrix...',
  'Evaluating SLA breach probability...',
  'Checking automated resolution history...',
  'Identifying emergency escalation contacts...',
];

export function EscalationModal({
  shipmentId,
  actions,
  onClose,
  onExecute,
  aiReasoning,
}: EscalationModalProps) {
  const [phase, setPhase] = useState<'loading' | 'contacts'>('loading');
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    // Progressive loading steps
    const timers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setLoadingStep(i + 1), (i + 1) * 420)
    );
    // Transition to contacts after all steps
    const finalTimer = setTimeout(() => setPhase('contacts'), LOADING_STEPS.length * 420 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, []);

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
                War Room &mdash; Escalation Protocol
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
            {phase === 'loading' ? (
              /* ── LOADING PHASE ──────────────────────────────────── */
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="px-6 py-8 space-y-6"
              >
                {/* Spinner + title */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-40" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                      <Sparkles size={24} className="text-amber-600 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">AI Analyzing Risk Profile</p>
                    <p className="mt-0.5 text-xs text-slate-500">Building escalation response plan…</p>
                  </div>
                </div>

                {/* Progressive steps */}
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
                        <Circle size={14} className="text-slate-300 shrink-0" />
                      )}
                      <span className="text-xs text-amber-800">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* ── CONTACTS PHASE ─────────────────────────────────── */
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-4 space-y-4"
              >
                {/* AI Reasoning Panel */}
                {aiReasoning && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs space-y-3">
                    {/* AI header */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-100">
                        <Sparkles size={11} className="text-amber-700" />
                      </div>
                      <span className="font-semibold text-amber-800 text-[11px] uppercase tracking-wide">
                        AI Assessment — Why Escalation is Required
                      </span>
                    </div>

                    {/* Trigger */}
                    <div>
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-0.5">
                        Escalation Trigger
                      </p>
                      <p className="text-amber-900 font-medium">{aiReasoning.triggerSummary}</p>
                    </div>

                    {/* Auto-resolution attempts */}
                    <div>
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                        Auto-Resolution Attempts Made
                      </p>
                      <div className="space-y-1">
                        {aiReasoning.attemptsMade.map((attempt, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <XCircle size={11} className="text-red-400 shrink-0 mt-0.5" />
                            <div className="grid grid-cols-[3.5rem_1fr_auto] gap-x-2 flex-1 min-w-0">
                              <span className="font-mono text-amber-600 font-medium">{attempt.time}</span>
                              <span className="text-amber-800 truncate">{attempt.action}</span>
                              <span className="text-red-500 whitespace-nowrap">{attempt.outcome}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Why human */}
                    <div>
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-0.5">
                        Why Human Intervention Required
                      </p>
                      <p className="text-amber-900 leading-relaxed">{aiReasoning.whyHuman}</p>
                    </div>

                    {/* Risk factors */}
                    <div>
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                        Risk Factors
                      </p>
                      <div className="space-y-1">
                        {aiReasoning.riskFactors.map((rf, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className={`h-2 w-2 rounded-full shrink-0 mt-1 ${riskDot[rf.level]}`} />
                            <div className="flex-1 min-w-0">
                              <span className={`font-semibold capitalize ${riskText[rf.level]}`}>
                                {rf.level}
                              </span>
                              <span className="text-amber-800 mx-1">—</span>
                              <span className="text-amber-900">{rf.label}:</span>
                              <span className="text-amber-700 ml-1">{rf.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Escalation Contact Cards */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Escalation Contacts — Click to Initiate
                  </p>
                  <div className="space-y-2.5">
                    {actions.map((action, idx) => {
                      const config = statusConfig[action.status];
                      const StatusIcon = config.icon;

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.07, duration: 0.25 }}
                          className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
                        >
                          {/* Card header */}
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                                <User size={12} className="text-slate-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 leading-tight">
                                  {action.contact?.name ?? action.target}
                                </p>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  {action.contact?.role ?? action.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <StatusIcon size={14} className={config.color} />
                              <span className={`text-[11px] font-medium ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>

                          {/* Contact details */}
                          {action.contact && (
                            <div className="px-4 py-2.5 space-y-1.5">
                              {/* Primary phone */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Phone size={11} className="text-slate-400 shrink-0" />
                                  <span className="font-mono text-xs text-slate-700">
                                    {action.contact.phone}
                                  </span>
                                  <span className="text-[10px] text-slate-400">Primary</span>
                                </div>
                                <a
                                  href={`tel:${action.contact.phone.replace(/\D/g, '')}`}
                                  className="flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700 hover:bg-green-200 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone size={10} />
                                  Call
                                </a>
                              </div>

                              {/* Alt phone */}
                              {action.contact.altPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone size={11} className="text-slate-400 shrink-0" />
                                  <span className="font-mono text-xs text-slate-500">
                                    {action.contact.altPhone}
                                  </span>
                                  <span className="text-[10px] text-slate-400">Alt / Mobile</span>
                                </div>
                              )}

                              {/* Email */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Mail size={11} className="text-slate-400 shrink-0" />
                                  <span className="text-xs text-slate-600 truncate">
                                    {action.contact.email}
                                  </span>
                                </div>
                                <a
                                  href={`mailto:${action.contact.email}`}
                                  className="flex items-center gap-1 rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-200 transition-colors ml-2 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail size={10} />
                                  Email
                                </a>
                              </div>

                              {/* Context note */}
                              <p className="text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                                {action.description}
                              </p>
                            </div>
                          )}

                          {/* Fallback: no contact details */}
                          {!action.contact && (
                            <div className="px-4 py-2">
                              <p className="text-xs text-slate-600">{action.description}</p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onExecute}
            disabled={phase === 'loading'}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Execute All Escalations
          </button>
        </div>
      </motion.div>
    </div>
  );
}
