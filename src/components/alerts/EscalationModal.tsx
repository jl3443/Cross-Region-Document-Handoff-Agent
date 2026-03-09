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
  pending: { icon: Circle, color: 'text-neutral-500', label: 'Pending' },
  sent: { icon: ArrowUpRight, color: 'text-blue-400', label: 'Sent' },
  confirmed: { icon: CheckCircle, color: 'text-emerald-400', label: 'Confirmed' },
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-400">
                War Room &mdash; Escalation Protocol
              </h2>
              <p className="mt-0.5 font-mono text-xs text-neutral-500">
                {shipmentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
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
                  className="flex items-start gap-4 rounded-lg border border-neutral-800 bg-neutral-800/50 p-4 transition-colors hover:bg-neutral-800"
                >
                  {/* Status indicator */}
                  <div className="mt-0.5 shrink-0">
                    <StatusIcon size={20} className={config.color} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {action.target}
                      </p>
                      <span
                        className={`shrink-0 text-xs font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-neutral-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700"
          >
            Cancel
          </button>
          <button
            onClick={onExecute}
            className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            Execute All Escalations
          </button>
        </div>
      </motion.div>
    </div>
  );
}
