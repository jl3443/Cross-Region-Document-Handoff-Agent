import { motion } from 'framer-motion';
import { X, AlertTriangle, ArrowUpRight, CheckCircle, Circle } from 'lucide-react';

interface EscalationAction {
  target: string;
  description: string;
  status: 'pending' | 'sent' | 'confirmed';
}

interface EscalationModalProps {
  shipmentId: string;
  actions: EscalationAction[];
  onClose: () => void;
  onExecute: () => void;
}

const statusConfig: Record<
  EscalationAction['status'],
  { icon: React.ElementType; color: string; label: string }
> = {
  pending: { icon: Circle, color: 'text-slate-400', label: 'Pending' },
  sent: { icon: ArrowUpRight, color: 'text-blue-500', label: 'Sent' },
  confirmed: { icon: CheckCircle, color: 'text-green-500', label: 'Confirmed' },
};

export function EscalationModal({
  shipmentId,
  actions,
  onClose,
  onExecute,
}: EscalationModalProps) {
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
          className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl"
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
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {shipmentId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Actions list */}
          <div className="max-h-80 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              {actions.map((action, idx) => {
                const config = statusConfig[action.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                  >
                    {/* Status indicator */}
                    <div className="mt-0.5 shrink-0">
                      <StatusIcon size={20} className={config.color} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {action.target}
                        </p>
                        <span
                          className={`shrink-0 text-xs font-medium ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-snug text-slate-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Execute All Escalations
            </button>
          </div>
        </motion.div>
    </div>
  );
}
