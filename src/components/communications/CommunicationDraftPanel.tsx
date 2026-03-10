import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Send, Pencil, Check, MailCheck, Clock, Calendar, CheckCircle2 } from 'lucide-react';
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

  // Task 4: Post-send tracking state (per tab)
  const [sentTabs, setSentTabs] = useState<Record<string, string>>({}); // tab → ISO sentAt
  const [elapsedMinutes, setElapsedMinutes] = useState<Record<string, number>>({});
  const [followupDatetimes, setFollowupDatetimes] = useState<Record<string, string>>({});
  const [showCustomCalendar, setShowCustomCalendar] = useState<Record<string, boolean>>({});
  const [scheduledFollowups, setScheduledFollowups] = useState<Record<string, string | null>>({}); // tab → '2days' | ISO | null

  // Live elapsed time counter — updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const updates: Record<string, number> = {};
      Object.entries(sentTabs).forEach(([tab, sentAt]) => {
        updates[tab] = Math.floor((Date.now() - new Date(sentAt).getTime()) / 60000);
      });
      if (Object.keys(updates).length > 0) {
        setElapsedMinutes(updates);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [sentTabs]);

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

  const handleSend = () => {
    const sentAt = new Date().toISOString();
    setSentTabs((prev) => ({ ...prev, [activeTab]: sentAt }));
    // Pre-fill follow-up datetime with +48h (2 days)
    const d = new Date(Date.now() + 48 * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setFollowupDatetimes((prev) => ({ ...prev, [activeTab]: dt }));
    setElapsedMinutes((prev) => ({ ...prev, [activeTab]: 0 }));
    onSend(activeTab, currentSubject, currentBody);
  };

  const handleSchedule2Days = () => {
    setScheduledFollowups((prev) => ({ ...prev, [activeTab]: '2days' }));
  };

  const handleScheduleCustom = () => {
    if (followupDatetimes[activeTab]) {
      setScheduledFollowups((prev) => ({ ...prev, [activeTab]: followupDatetimes[activeTab] }));
      setShowCustomCalendar((prev) => ({ ...prev, [activeTab]: false }));
    }
  };

  const formatSentTime = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatScheduledDatetime = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!activeDraft) return null;

  const isBodyEdited = editedBodies[activeTab] !== undefined;
  const isSubjectEdited = editedSubjects[activeTab] !== undefined;
  const isSent = !!sentTabs[activeTab];
  const scheduled = scheduledFollowups[activeTab];
  const customCalendarOpen = showCustomCalendar[activeTab] ?? false;
  const elapsed = elapsedMinutes[activeTab] ?? 0;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Communication Drafts
          </h2>
          {isSent ? (
            <span className="text-[10px] rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium inline-flex items-center gap-1">
              <MailCheck className="h-2.5 w-2.5" />
              Sent
            </span>
          ) : (
            <span className="text-[10px] rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 font-medium">
              Editable
            </span>
          )}
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
        {drafts.map((draft) => {
          const tabSent = !!sentTabs[draft.tab];
          return (
            <button
              key={draft.tab}
              onClick={() => handleTabChange(draft.tab)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === draft.tab
                  ? 'text-[#0000B3]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1">
                {draft.tab}
                {tabSent && <MailCheck className="h-3 w-3 text-green-600" />}
              </span>
              {activeTab === draft.tab && (
                <motion.div
                  layoutId="draft-tab-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0000B3]"
                />
              )}
            </button>
          );
        })}
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
                {editingSubject && !isSent ? (
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
                    {!isSent && (
                      <button
                        onClick={() => setEditingSubject(true)}
                        className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit subject"
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Editable email body */}
            <div className="relative">
              {isBodyEdited && !isSent && (
                <div className="absolute top-2 right-2 z-10 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-600 uppercase tracking-wide">
                  Edited
                </div>
              )}
              <textarea
                value={currentBody}
                onChange={(e) => !isSent && handleBodyChange(e.target.value)}
                readOnly={isSent}
                rows={isSent ? 12 : 18}
                className={`w-full rounded-lg border bg-white p-4 shadow-sm resize-none transition-colors ${
                  isSent
                    ? 'border-slate-100 bg-slate-50/50 text-slate-400 cursor-default'
                    : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300'
                }`}
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                  fontSize: '12.5px',
                  lineHeight: '1.65',
                  color: isSent ? '#94a3b8' : '#334155',
                }}
              />
              {!isSent && (
                <p className="mt-1 text-[10px] text-slate-400 text-right">
                  Click to edit · Changes will be sent as-is
                </p>
              )}
            </div>

            {/* ── Task 4: Follow-up Tracker (shown after send) ── */}
            {isSent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="mt-4 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
              >
                {/* Sent confirmation row */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-green-50/60">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                      <MailCheck className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-800">
                        Email sent at {formatSentTime(sentTabs[activeTab])}
                      </p>
                      <p className="text-[10px] text-green-700/80">No reply received yet</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{elapsed === 0 ? 'Just now' : `${elapsed} min ago`}</span>
                  </div>
                </div>

                {/* Follow-up scheduler */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-700">Schedule Follow-up Email</p>
                  </div>

                  {scheduled ? (
                    /* Scheduled confirmation */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 rounded-lg border border-[#0000B3]/20 bg-blue-50/60 px-3 py-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#0000B3] shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-[#0000B3]">Follow-up scheduled</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {scheduled === '2days'
                            ? 'Sending in 2 days if no reply received'
                            : `Sending on ${formatScheduledDatetime(scheduled)}`}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    /* Two-option selector */
                    <div className="space-y-2">
                      {!customCalendarOpen ? (
                        <div className="flex gap-2">
                          {/* Quick option: 2 days */}
                          <button
                            onClick={handleSchedule2Days}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-[#0000B3]/40 hover:bg-blue-50/50 hover:text-[#0000B3]"
                          >
                            <Send className="h-3 w-3" />
                            Send in 2 days
                          </button>
                          {/* Custom option */}
                          <button
                            onClick={() => setShowCustomCalendar((prev) => ({ ...prev, [activeTab]: true }))}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-[#0000B3]/40 hover:bg-blue-50/50 hover:text-[#0000B3]"
                          >
                            <Calendar className="h-3 w-3" />
                            Set custom time →
                          </button>
                        </div>
                      ) : (
                        /* Custom datetime picker */
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <div className="flex gap-2 items-center">
                            <input
                              type="datetime-local"
                              value={followupDatetimes[activeTab] ?? ''}
                              min={new Date().toISOString().slice(0, 16)}
                              onChange={(e) =>
                                setFollowupDatetimes((prev) => ({ ...prev, [activeTab]: e.target.value }))
                              }
                              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000B3]/30 focus:border-[#0000B3]/40"
                            />
                            <button
                              onClick={handleScheduleCustom}
                              disabled={!followupDatetimes[activeTab]}
                              className="rounded-lg bg-[#0000B3] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#000099] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Confirm
                            </button>
                          </div>
                          <button
                            onClick={() => setShowCustomCalendar((prev) => ({ ...prev, [activeTab]: false }))}
                            className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            ← Back to quick options
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
        {!isSent ? (
          <>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Copy size={15} />
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0000B3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#000099]"
            >
              <Send size={15} />
              Send Now
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-slate-500">
              {Object.values(sentTabs).length} of {drafts.length} sent
            </span>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Check size={15} />
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
