import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Send, Pencil, Check } from 'lucide-react';
import type { EmailDraft } from '../../data/types';

interface CommunicationDraftPanelProps {
  drafts: EmailDraft[];
  onSend: (tab: string, editedSubject: string, editedBody: string) => void;
  onClose: () => void;
}

export function CommunicationDraftPanel({
  drafts,
  onSend,
  onClose,
}: CommunicationDraftPanelProps) {
  const [activeTab, setActiveTab] = useState(drafts[0]?.tab ?? '');
  const [copied, setCopied] = useState(false);
  // Per-tab edit state: keyed by tab name
  const [editedSubjects, setEditedSubjects] = useState<Record<string, string>>({});
  const [editedBodies, setEditedBodies] = useState<Record<string, string>>({});
  const [editingSubject, setEditingSubject] = useState(false);

  const activeDraft = drafts.find((d) => d.tab === activeTab) ?? drafts[0];

  // Resolve current subject/body (edited value takes priority)
  const currentSubject = editedSubjects[activeTab] ?? activeDraft?.subject ?? '';
  const currentBody = editedBodies[activeTab] ?? activeDraft?.body ?? '';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setEditingSubject(false);
  };

  const handleBodyChange = (val: string) => {
    setEditedBodies((prev) => ({ ...prev, [activeTab]: val }));
  };

  const handleSubjectChange = (val: string) => {
    setEditedSubjects((prev) => ({ ...prev, [activeTab]: val }));
  };

  const handleCopy = () => {
    if (!activeDraft) return;
    const text = [
      `To: ${activeDraft.to}`,
      activeDraft.cc ? `CC: ${activeDraft.cc}` : null,
      `Subject: ${currentSubject}`,
      '',
      currentBody,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeDraft) return null;

  const isBodyEdited = editedBodies[activeTab] !== undefined;
  const isSubjectEdited = editedSubjects[activeTab] !== undefined;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Communication Drafts
          </h2>
          <span className="text-[10px] rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 font-medium">
            Editable
          </span>
        </div>
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
            onClick={() => handleTabChange(draft.tab)}
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
            <div className="space-y-2 mb-4">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="w-16 shrink-0 text-right font-medium text-slate-400">To:</span>
                <span className="font-medium text-slate-800">{activeDraft.to}</span>
              </div>
              {activeDraft.cc && (
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="w-16 shrink-0 text-right font-medium text-slate-400">CC:</span>
                  <span className="text-slate-600">{activeDraft.cc}</span>
                </div>
              )}
              {/* Editable subject */}
              <div className="flex items-center gap-2 text-sm">
                <span className="w-16 shrink-0 text-right font-medium text-slate-400">Subject:</span>
                {editingSubject ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={currentSubject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="flex-1 rounded border border-blue-300 px-2 py-0.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      autoFocus
                      onBlur={() => setEditingSubject(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingSubject(false)}
                    />
                    <button
                      onClick={() => setEditingSubject(false)}
                      className="rounded p-0.5 text-green-600 hover:bg-green-50"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-1.5 group">
                    <span className={`font-semibold text-slate-900 flex-1 ${isSubjectEdited ? 'text-blue-700' : ''}`}>
                      {currentSubject}
                    </span>
                    <button
                      onClick={() => setEditingSubject(true)}
                      className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Edit subject"
                    >
                      <Pencil size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Editable email body */}
            <div className="relative">
              {isBodyEdited && (
                <div className="absolute top-2 right-2 z-10 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-600 uppercase tracking-wide">
                  Edited
                </div>
              )}
              <textarea
                value={currentBody}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={18}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-colors"
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                  fontSize: '12.5px',
                  lineHeight: '1.65',
                  color: '#334155',
                }}
              />
              <p className="mt-1 text-[10px] text-slate-400 text-right">
                Click to edit · Changes will be sent as-is
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
          onClick={() => onSend(activeTab, currentSubject, currentBody)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0000B3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#000099]"
        >
          <Send size={15} />
          Send Now
        </button>
      </div>
    </div>
  );
}
