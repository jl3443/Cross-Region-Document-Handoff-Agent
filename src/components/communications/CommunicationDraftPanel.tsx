import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Send } from 'lucide-react';
import type { EmailDraft } from '../../data/types';

interface CommunicationDraftPanelProps {
  drafts: EmailDraft[];
  onSend: (tab: string) => void;
  onClose: () => void;
}

export function CommunicationDraftPanel({
  drafts,
  onSend,
  onClose,
}: CommunicationDraftPanelProps) {
  const [activeTab, setActiveTab] = useState(drafts[0]?.tab ?? '');
  const [copied, setCopied] = useState(false);

  const activeDraft = drafts.find((d) => d.tab === activeTab) ?? drafts[0];

  const handleCopy = () => {
    if (!activeDraft) return;
    const text = [
      `To: ${activeDraft.to}`,
      activeDraft.cc ? `CC: ${activeDraft.cc}` : null,
      `Subject: ${activeDraft.subject}`,
      '',
      activeDraft.body,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeDraft) return null;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Communication Drafts
        </h2>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4">
        {drafts.map((draft) => (
          <button
            key={draft.tab}
            onClick={() => setActiveTab(draft.tab)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === draft.tab
                ? 'text-[#0000B3]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {draft.tab}
            {activeTab === draft.tab && (
              <motion.div
                layoutId="draft-tab-indicator"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0000B3]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDraft.tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Email fields */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="w-16 shrink-0 text-right font-medium text-slate-400">
                  To:
                </span>
                <span className="font-medium text-slate-800">
                  {activeDraft.to}
                </span>
              </div>
              {activeDraft.cc && (
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="w-16 shrink-0 text-right font-medium text-slate-400">
                    CC:
                  </span>
                  <span className="text-slate-600">{activeDraft.cc}</span>
                </div>
              )}
              <div className="flex items-baseline gap-2 text-sm">
                <span className="w-16 shrink-0 text-right font-medium text-slate-400">
                  Subject:
                </span>
                <span className="font-semibold text-slate-900">
                  {activeDraft.subject}
                </span>
              </div>
            </div>

            {/* Email body */}
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p
                className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700"
                style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}
              >
                {activeDraft.body}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Copy size={15} />
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={() => onSend(activeTab)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0000B3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#000099]"
        >
          <Send size={15} />
          Send Now
        </button>
      </div>
    </div>
  );
}
