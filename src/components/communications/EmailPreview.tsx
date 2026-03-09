import type { EmailDraft } from '../../data/types';

interface EmailPreviewProps {
  draft: EmailDraft;
}

export function EmailPreview({ draft }: EmailPreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header fields */}
      <div className="space-y-1.5 border-b border-slate-100 px-4 py-3">
        <div className="flex items-baseline gap-2 text-sm">
          <span className="w-14 shrink-0 text-right text-xs font-medium uppercase tracking-wide text-slate-400">
            To
          </span>
          <span className="font-medium text-slate-800">{draft.to}</span>
        </div>
        {draft.cc && (
          <div className="flex items-baseline gap-2 text-sm">
            <span className="w-14 shrink-0 text-right text-xs font-medium uppercase tracking-wide text-slate-400">
              CC
            </span>
            <span className="text-slate-600">{draft.cc}</span>
          </div>
        )}
        <div className="flex items-baseline gap-2 text-sm">
          <span className="w-14 shrink-0 text-right text-xs font-medium uppercase tracking-wide text-slate-400">
            Subject
          </span>
          <span className="font-semibold text-slate-900">{draft.subject}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {draft.body}
          </p>
        </div>
      </div>
    </div>
  );
}
