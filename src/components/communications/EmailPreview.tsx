import type { EmailDraft } from '../../data/types';

interface EmailPreviewProps {
  draft: EmailDraft;
}

export function EmailPreview({ draft }: EmailPreviewProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      {/* Header fields */}
      <div className="space-y-1.5 border-b border-neutral-800 px-4 py-3">
        <div className="flex items-baseline gap-2 text-sm">
          <span className="w-14 shrink-0 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
            To
          </span>
          <span className="font-medium text-white">{draft.to}</span>
        </div>
        {draft.cc && (
          <div className="flex items-baseline gap-2 text-sm">
            <span className="w-14 shrink-0 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
              CC
            </span>
            <span className="text-neutral-400">{draft.cc}</span>
          </div>
        )}
        <div className="flex items-baseline gap-2 text-sm">
          <span className="w-14 shrink-0 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
            Subject
          </span>
          <span className="font-semibold text-white">{draft.subject}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <div className="rounded-lg bg-neutral-800/50 border border-neutral-700/50 p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
            {draft.body}
          </p>
        </div>
      </div>
    </div>
  );
}
