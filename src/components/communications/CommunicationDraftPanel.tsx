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
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Communication Drafts
        </h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-800 bg-neutral-900/50 px-4">
        {drafts.map((draft) => (
          <button
            key={draft.tab}
            onClick={() => setActiveTab(draft.tab)}
            className={`relative px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === draft.tab
                ? 'text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {draft.tab}
            {activeTab === draft.tab && (
              <motion.div
                layoutId="draft-tab-indicator"
                className="absolute inset-x-0 bottom-0 h-px bg-white"
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
            <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
              <div className="flex items-baseline gap-3 text-xs">
                <span className="w-14 shrink-0 text-right font-medium text-neutral-600">To:</span>
                <span className="font-medium text-white">{activeDraft.to}</span>
              </div>
              {activeDraft.cc && (
                <div className="flex items-baseline gap-3 text-xs">
                  <span className="w-14 shrink-0 text-right font-medium text-neutral-600">CC:</span>
                  <span className="text-neutral-400">{activeDraft.cc}</span>
                </div>
              )}
              <div className="flex items-baseline gap-3 text-xs">
                <span className="w-14 shrink-0 text-right font-medium text-neutral-600">Subject:</span>
                <span className="font-semibold text-white">{activeDraft.subject}</span>
              </div>
            </div>

            {/* Email body */}
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-300">
                {activeDraft.body}
              </pre>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-2 border-t border-neutral-800 bg-neutral-900/50 px-5 py-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
        >
          <Copy size={13} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => onSend(activeTab)}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-neutral-200"
        >
          <Send size={13} />
          Send Now
        </button>
      </div>
    </div>
  );
}
