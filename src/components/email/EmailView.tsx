import { useState, useEffect, useRef } from 'react';
import { Inbox, Send, Mail, Reply, FileText, X, CheckCircle2, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InboxEmail, SentEmail, ResolveDocType } from '@/data/types';

interface EmailViewProps {
  subView: 'inbox' | 'sent';
  onSubViewChange: (v: 'inbox' | 'sent') => void;
  inboxEmails: InboxEmail[];
  sentEmails: SentEmail[];
  onMarkRead: (id: string) => void;
  onReadReply?: (emailId: string) => void;
  onNavigateDocuments?: () => void;
}

function formatEmailTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return ts;
  }
}

function formatEmailFull(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

// ─── PDF Viewer Modal ─────────────────────────────────────────────────────────

function PdfViewerModal({
  docType,
  fileName,
  onClose,
}: {
  docType: ResolveDocType;
  fileName: string;
  onClose: () => void;
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const renderContent = () => {
    if (docType === 'isf') {
      return (
        <div className="font-mono text-[11px] leading-relaxed text-slate-800">
          <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
            <p className="text-[13px] font-bold tracking-wide">IMPORTER SECURITY FILING (ISF-10)</p>
            <p className="text-[11px] font-semibold text-slate-600">U.S. Customs &amp; Border Protection — Automated Manifest System</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-slate-500">Filing Reference:</span><span className="font-bold text-green-800">ISF-2024-88412</span>
            <span className="text-slate-500">Status:</span><span className="font-bold text-green-700">✓ ACCEPTED</span>
            <span className="text-slate-500">Filed:</span><span>{dateStr} at {timeStr}</span>
            <span className="text-slate-500">Filed by:</span><span>Global Forwarding LLC (Bond #12-345678)</span>
          </div>
          <div className="border-t border-slate-300 pt-2 mb-3">
            <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-2">Shipment Identification</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <span className="text-slate-500">Bill of Lading:</span><span>MSKU-7294810</span>
              <span className="text-slate-500">Route:</span><span>CNSHA → USLAX</span>
              <span className="text-slate-500">Vessel:</span><span>Maersk Eindhoven V.248E</span>
              <span className="text-slate-500">ETD:</span><span>2024-03-10 18:00 CST</span>
            </div>
          </div>
          <div className="border-t border-slate-300 pt-2 mb-3">
            <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-2">ISF-10 Data Elements (All 10 Required)</p>
            <div className="space-y-1">
              {[
                ['1. Seller', 'Shanghai LCD Global Electronics Co., Ltd. — No. 12 Longhua Rd, Shenzhen CN'],
                ['2. Buyer', 'Pacific Electronics Group Inc. — 350 Harbor Blvd, Los Angeles CA 90013'],
                ['3. Importer of Record', '#98-7654321 (Bond Active)'],
                ['4. Consignee', '#98-7654321'],
                ['5. Manufacturer', 'LCD Global Manufacturing — Shenzhen Plant'],
                ['6. Ship-to', 'Pacific Electronics Distribution Center, Carson CA'],
                ['7. Country of Origin', 'CN (China)'],
                ['8. HTSUS Number', '8531.20.0020 (LCD Monitors & Displays)'],
                ['9. Booking Reference', 'BKG-448291 / Maersk'],
                ['10. Foreign Port of Lading', 'CNSHA — Shanghai Yangshan Deep Water Port'],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[160px_1fr] gap-2">
                  <span className="text-slate-500 shrink-0">{label}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 text-center font-semibold">
            All 10 required data elements verified. No discrepancies. CBP Bond Active (Continuous).
          </div>
        </div>
      );
    }

    if (docType === 'invoice') {
      return (
        <div className="font-mono text-[11px] leading-relaxed text-slate-800">
          <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
            <p className="text-[13px] font-bold tracking-wide">COMMERCIAL INVOICE — REVISION 2</p>
            <p className="text-[11px] font-semibold text-red-600">CORRECTED DOCUMENT</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Supersedes INV-2024-8821 (Original)</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <span className="text-slate-500">Invoice No.:</span><span className="font-bold">INV-2024-8821-R2</span>
            <span className="text-slate-500">Date:</span><span>{dateStr}</span>
            <span className="text-slate-500">Correction Reason:</span><span className="text-amber-700">Value transcription error</span>
            <span className="text-slate-500">PO Reference:</span><span>PO-8821</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-1">Exporter</p>
              <p>Shenzhen Export Group Ltd.</p>
              <p className="text-slate-500">Tower B, Keji South Road</p>
              <p className="text-slate-500">Shenzhen, Guangdong, CN</p>
            </div>
            <div>
              <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-1">Importer</p>
              <p>Pacific Electronics Group Inc.</p>
              <p className="text-slate-500">350 Harbor Blvd</p>
              <p className="text-slate-500">Los Angeles, CA 90013</p>
            </div>
          </div>
          <div className="border-t border-slate-300 pt-2 mb-3">
            <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-2">Line Items</p>
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="grid grid-cols-[1fr_60px_100px] gap-2 bg-slate-100 px-3 py-1 font-bold text-[10px] uppercase text-slate-600">
                <span>Description</span><span className="text-right">Qty</span><span className="text-right">Value (USD)</span>
              </div>
              <div className="grid grid-cols-[1fr_60px_100px] gap-2 px-3 py-1.5 border-t border-slate-200">
                <span>LCD Display Panels (32", 4K UHD)</span><span className="text-right">500</span><span className="text-right">45,000.00</span>
              </div>
              <div className="grid grid-cols-[1fr_60px_100px] gap-2 px-3 py-1.5 border-t border-slate-200">
                <span>Mounting Hardware &amp; Accessories</span><span className="text-right">200</span><span className="text-right">7,000.00</span>
              </div>
              <div className="grid grid-cols-[1fr_60px_100px] gap-2 px-3 py-2 border-t-2 border-slate-400 font-bold bg-slate-50">
                <span className="col-span-2">TOTAL (CORRECTED)</span><span className="text-right text-green-700">52,000.00</span>
              </div>
              <div className="grid grid-cols-[1fr_60px_100px] gap-2 px-3 py-1 text-red-400 line-through text-[10px]">
                <span className="col-span-2">Original (INCORRECT)</span><span className="text-right">48,000.00</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-[10px] mb-3">
            <div><span className="text-slate-500">Incoterms:</span> CIF Los Angeles</div>
            <div><span className="text-slate-500">Payment:</span> Net 30 Days</div>
            <div><span className="text-slate-500">Currency:</span> USD</div>
          </div>
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 text-center font-semibold">
            This revision supersedes all prior versions. Verified by Shenzhen Export Desk Accounts.
          </div>
        </div>
      );
    }

    if (docType === 'msds') {
      return (
        <div className="font-mono text-[11px] leading-relaxed text-slate-800">
          <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
            <p className="text-[13px] font-bold tracking-wide">MATERIAL SAFETY DATA SHEET (SDS/MSDS)</p>
            <p className="text-[11px] font-semibold text-slate-600">Version 3.1 — High Resolution Reissue</p>
            <p className="text-[10px] text-slate-500">GHS Compliant · 16-Section Format · IMDG Code Compliant</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
            <span className="text-slate-500">Product Name:</span><span className="font-bold">Flammable Liquid N.O.S. (Ethyl Acetate)</span>
            <span className="text-slate-500">UN Number:</span><span className="font-bold text-orange-700">UN 1993</span>
            <span className="text-slate-500">DG Class:</span><span className="font-bold">Class 3 — Flammable Liquids</span>
            <span className="text-slate-500">Packing Group:</span><span>II (Medium Danger)</span>
            <span className="text-slate-500">Prepared by:</span><span>EuroChem Supply — Export Compliance</span>
            <span className="text-slate-500">Version:</span><span className="text-green-700 font-bold">3.1 (High Res Reissue — {dateStr})</span>
          </div>
          <div className="border-t border-slate-300 pt-2 mb-3">
            <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Section 2: Hazard Identification</p>
            <p><span className="font-bold">Signal Word:</span> DANGER</p>
            <div className="ml-2 mt-1 space-y-0.5">
              <p>H225 — Highly flammable liquid and vapour</p>
              <p>H319 — Causes serious eye irritation</p>
              <p>H336 — May cause drowsiness or dizziness</p>
            </div>
          </div>
          <div className="border-t border-slate-300 pt-2 mb-3">
            <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Section 3: Composition</p>
            <div className="grid grid-cols-3 gap-2">
              <div><span className="text-slate-500">Component:</span> Ethyl Acetate</div>
              <div><span className="text-slate-500">CAS:</span> 141-78-6</div>
              <div><span className="text-slate-500">Conc.:</span> ≥ 99.5%</div>
            </div>
          </div>
          <div className="border-t border-slate-300 pt-2 mb-3">
            <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Section 4: First-Aid Measures</p>
            <div className="space-y-0.5">
              <p><span className="font-semibold">Inhalation:</span> Move to fresh air. Seek medical attention if symptoms persist.</p>
              <p><span className="font-semibold">Skin:</span> Wash with soap and water 15+ min. Remove contaminated clothing.</p>
              <p><span className="font-semibold">Eyes:</span> Rinse with copious water 15+ min. Seek immediate medical attention.</p>
              <p><span className="font-semibold">Ingestion:</span> Do NOT induce vomiting. Seek immediate medical aid.</p>
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 text-center font-semibold">
            All 16 sections complete &amp; legible. SOLAS &amp; IMDG Code compliant. 24/7 Emergency: +1 (800) 555-CHEM
          </div>
        </div>
      );
    }

    // general
    return (
      <div className="font-mono text-[11px] leading-relaxed text-slate-800">
        <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
          <p className="text-[13px] font-bold tracking-wide">DOCUMENT UPDATE REFERENCE</p>
          <p className="text-[10px] text-slate-500">Shipment Documentation Package</p>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded mb-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <span className="text-slate-500">Document Date:</span><span>{dateStr}</span>
            <span className="text-slate-500">Reference:</span><span>DOC-REF-2024-{Math.floor(Math.random() * 9000) + 1000}</span>
            <span className="text-slate-500">Status:</span><span className="font-bold text-green-700">✓ SUBMITTED</span>
          </div>
        </div>
        <p>Please find attached the updated documentation for your shipment record.</p>
        <p className="mt-2 text-slate-500">This document has been reviewed and approved by the operations team.</p>
        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 text-center font-semibold">
          Documentation submitted. Please confirm receipt.
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-xl bg-white shadow-2xl flex flex-col max-h-[85vh]">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-slate-700 px-4 py-2.5 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-red-400" />
            <span className="text-sm font-medium text-white truncate max-w-[420px]">{fileName}</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* PDF area */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-6">
          <div className="bg-white shadow-lg rounded mx-auto max-w-[640px] p-10 min-h-[580px]">
            {renderContent()}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 bg-slate-50 rounded-b-xl">
          <span className="text-xs text-slate-500">Page 1 of 1 — {fileName}</span>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Agent Matching Card ───────────────────────────────────────────────────

function AiAgentCard({
  resolveDocType,
  onNavigateDocuments,
}: {
  resolveDocType: ResolveDocType;
  onNavigateDocuments?: () => void;
}) {
  const [phase, setPhase] = useState<'matching' | 'matched'>('matching');
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPhase('matching');
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(intervalRef.current!); return 90; }
        return Math.min(p + Math.random() * 9 + 3, 90);
      });
    }, 160);

    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setProgress(100);
      setPhase('matched');
    }, 3200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resolveDocType]);

  const docLabel: Record<ResolveDocType, string> = {
    isf: 'Importer Security Filing (ISF-10)',
    invoice: 'Commercial Invoice (Rev. 2)',
    msds: 'Material Safety Data Sheet (MSDS)',
    bol: 'Bill of Lading (BOL)',
    general: 'Shipment Document Package',
  };

  if (phase === 'matching') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 shrink-0">
            <Loader2 size={13} className="text-blue-600 animate-spin" />
          </div>
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">AI Document Agent — Processing</span>
        </div>
        <div className="space-y-1.5 text-xs text-blue-700">
          <p>✦ Attachment received — extracting document data...</p>
          <p>✦ Running AI match against shipment record...</p>
          <p className="text-blue-500">⟳ Verifying all data elements against system of record...</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-blue-600 font-medium">
            <span>AI Matching Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-blue-200 overflow-hidden">
            <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 shrink-0">
          <CheckCircle2 size={13} className="text-green-600" />
        </div>
        <span className="text-xs font-bold text-green-800 uppercase tracking-wide">AI Document Agent — Match Complete</span>
      </div>
      <div className="space-y-1.5 text-xs text-green-700">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-green-500 shrink-0" />
          <span>Attachment validated: <span className="font-semibold">{docLabel[resolveDocType]}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-green-500 shrink-0" />
          <span>All data elements verified against shipment record</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-green-500 shrink-0" />
          <span>Document status updated: <span className="font-semibold text-green-800">Missing → Validated</span></span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-green-200">
        <div className="h-1.5 w-full rounded-full bg-green-500" />
      </div>
      {onNavigateDocuments && (
        <button
          onClick={onNavigateDocuments}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
        >
          <ArrowRight size={13} />
          View Updated Document Status
        </button>
      )}
    </div>
  );
}

// ─── Main Email View ──────────────────────────────────────────────────────────

export function EmailView({
  subView,
  onSubViewChange,
  inboxEmails,
  sentEmails,
  onMarkRead,
  onReadReply,
  onNavigateDocuments,
}: EmailViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState<{ name: string; docType: ResolveDocType } | null>(null);

  const unreadCount = inboxEmails.filter((e) => !e.read).length;

  const handleSelectInbox = (email: InboxEmail) => {
    setSelectedId(email.id);
    if (!email.read) onMarkRead(email.id);
    // When user opens a reply email, notify parent to confirm the action
    if (email.isReply && onReadReply) onReadReply(email.id);
  };

  const handleSubViewChange = (v: 'inbox' | 'sent') => {
    setSelectedId(null);
    onSubViewChange(v);
  };

  const selectedInbox = subView === 'inbox' ? inboxEmails.find((e) => e.id === selectedId) : null;
  const selectedSent = subView === 'sent' ? sentEmails.find((e) => e.id === selectedId) : null;

  return (
    <div className="flex flex-col h-full space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Email</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Shipment communications inbox</p>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 mb-3 border-b border-border">
        <button
          onClick={() => handleSubViewChange('inbox')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors relative',
            subView === 'inbox' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Inbox size={14} />
          Inbox
          {unreadCount > 0 && (
            <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
          {subView === 'inbox' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-t" />}
        </button>
        <button
          onClick={() => handleSubViewChange('sent')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors relative',
            subView === 'sent' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Send size={14} />
          Sent
          {sentEmails.length > 0 && (
            <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-muted px-1 text-[9px] font-medium text-muted-foreground">
              {sentEmails.length}
            </span>
          )}
          {subView === 'sent' && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-t" />}
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-3 flex-1 min-h-0" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Left: email list */}
        <div className="w-80 flex-shrink-0 overflow-y-auto rounded-lg border border-border bg-card">
          {subView === 'inbox' && (
            <>
              {inboxEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                  <Inbox size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No emails</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {inboxEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => handleSelectInbox(email)}
                      className={cn(
                        'w-full text-left px-4 py-3 transition-colors hover:bg-muted/50',
                        selectedId === email.id && 'bg-primary/5 border-l-2 border-primary',
                        email.isReply && !email.read && 'bg-blue-50/60'
                      )}
                    >
                      {email.isReply && (
                        <div className="flex items-center gap-1 mb-1">
                          <Reply size={9} className="text-blue-500" />
                          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">New Reply</span>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {!email.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                          <span className={cn('text-xs truncate', !email.read ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                            {email.fromName}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatEmailTime(email.timestamp)}</span>
                      </div>
                      <p className={cn('text-xs mt-0.5 truncate', !email.read ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                        {email.subject}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{email.body.slice(0, 60)}...</p>
                      {email.attachment && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText size={9} className="text-red-400 shrink-0" />
                          <span className="text-[9px] text-muted-foreground truncate">{email.attachment.name}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {subView === 'sent' && (
            <>
              {sentEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                  <Send size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No sent emails</p>
                  <p className="text-xs mt-1 text-center px-4">Emails you send from the Communications panel will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {[...sentEmails].reverse().map((sent) => (
                    <button
                      key={sent.id}
                      onClick={() => setSelectedId(sent.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 transition-colors hover:bg-muted/50',
                        selectedId === sent.id && 'bg-primary/5 border-l-2 border-primary'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-foreground truncate min-w-0">To: {sent.draft.tab}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatEmailTime(sent.timestamp)}</span>
                      </div>
                      <p className="text-xs mt-0.5 text-muted-foreground truncate">{sent.draft.subject}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{sent.draft.body.slice(0, 60)}...</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: email detail */}
        <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card">
          {subView === 'inbox' && selectedInbox ? (
            <div className="p-5 space-y-4">
              {/* AI Agent card — shown first for reply emails */}
              {selectedInbox.isReply && selectedInbox.resolveDocType && (
                <AiAgentCard
                  resolveDocType={selectedInbox.resolveDocType}
                  onNavigateDocuments={onNavigateDocuments}
                />
              )}

              {/* Email header */}
              <div className="border-b border-border pb-4">
                {selectedInbox.isReply && (
                  <div className="flex items-center gap-1.5 mb-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-1.5">
                    <Reply size={12} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">
                      Reply received — AI agent is matching the attached document
                    </span>
                  </div>
                )}
                <h3 className="text-base font-semibold text-foreground mb-2">{selectedInbox.subject}</h3>
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">From</span>
                    <span className="font-medium text-foreground">{selectedInbox.fromName}</span>
                    <span className="text-xs text-muted-foreground">&lt;{selectedInbox.from}&gt;</span>
                  </div>
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">Date</span>
                    <span className="text-muted-foreground text-xs">{formatEmailFull(selectedInbox.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Attachment chip */}
              {selectedInbox.attachment && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100 shrink-0">
                    <FileText size={15} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{selectedInbox.attachment.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedInbox.attachment.sizeKb} KB · PDF Document</p>
                  </div>
                  <button
                    onClick={() => setPdfOpen({ name: selectedInbox.attachment!.name, docType: selectedInbox.attachment!.docType })}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/50 transition-colors shrink-0"
                  >
                    <ExternalLink size={11} />
                    Open
                  </button>
                </div>
              )}

              {/* Email body */}
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                <p
                  className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700"
                  style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace", fontSize: '12.5px' }}
                >
                  {selectedInbox.body}
                </p>
              </div>
            </div>
          ) : subView === 'sent' && selectedSent ? (
            <div className="p-5">
              <div className="border-b border-border pb-4 mb-4">
                <h3 className="text-base font-semibold text-foreground mb-2">{selectedSent.draft.subject}</h3>
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">To</span>
                    <span className="font-medium text-foreground">{selectedSent.draft.to}</span>
                  </div>
                  {selectedSent.draft.cc && (
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">CC</span>
                      <span className="text-muted-foreground">{selectedSent.draft.cc}</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">Sent</span>
                    <span className="text-muted-foreground text-xs">{formatEmailFull(selectedSent.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                <p
                  className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700"
                  style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace", fontSize: '12.5px' }}
                >
                  {selectedSent.draft.body}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
              <Mail size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Select an email to read</p>
              <p className="text-xs mt-1">
                {subView === 'inbox'
                  ? `${inboxEmails.length} email${inboxEmails.length !== 1 ? 's' : ''} in inbox`
                  : sentEmails.length === 0
                  ? 'Send emails from the Communications tab'
                  : `${sentEmails.length} sent email${sentEmails.length !== 1 ? 's' : ''}`}
              </p>
              {subView === 'inbox' && unreadCount > 0 && (
                <div className="mt-2 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-primary">{unreadCount} unread</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {pdfOpen && (
        <PdfViewerModal
          docType={pdfOpen.docType}
          fileName={pdfOpen.name}
          onClose={() => setPdfOpen(null)}
        />
      )}
    </div>
  );
}
