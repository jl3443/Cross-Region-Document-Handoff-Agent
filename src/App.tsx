import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Flame,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Package,
  X,
  ArrowRight,
  ChevronLeft,
  Ship,
  Plane,
  Truck,
  Clock,
  Zap,
} from 'lucide-react';
import { scenarios as builtInScenarios } from '@/data/scenarios';
import { recentExceptions } from '@/data/dashboard-data';
import type { ExceptionStatus, Scenario, DocumentException, ResolutionAction, ViewId, InboxEmail, SentEmail, ResolveDocType, UserRole } from '@/data/types';
import { LoginPage } from '@/components/auth/LoginPage';
import { INITIAL_INBOX_EMAILS, generateReply } from '@/data/inbox-emails';
import { formatCountdown, getCutoffColor, cn } from '@/lib/utils';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { GateCheck } from '@/components/shipment/GateCheck';
import { RequiredDocsChecklist } from '@/components/shipment/RequiredDocsChecklist';
import { MatchingSummaryCard } from '@/components/shipment/MatchingSummaryCard';
import { ReadinessScore } from '@/components/shipment/ReadinessScore';
import { ShipmentListView } from '@/components/shipment/ShipmentListView';
import { HitlPanel } from '@/components/hitl/HitlPanel';

import { ExceptionTable } from '@/components/exceptions/ExceptionTable';
import { ExceptionDetailPanel, actionConfig } from '@/components/exceptions/ExceptionDetailPanel';

import { CommunicationDraftPanel } from '@/components/communications/CommunicationDraftPanel';
import { EmailPreview } from '@/components/communications/EmailPreview';

import { ResolutionTimeline } from '@/components/timeline/ResolutionTimeline';

import { RiskBanner } from '@/components/alerts/RiskBanner';
import { EscalationModal } from '@/components/alerts/EscalationModal';
import type { AiReasoning, ActionOption } from '@/components/alerts/EscalationModal';

import { EmailView } from '@/components/email/EmailView';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';

import { AiChatPanel } from '@/components/ai/AiChatPanel';
import { ScenarioUploadModal } from '@/components/ui/ScenarioUploadModal';
import { DocumentUploadZone } from '@/components/ui/DocumentUploadZone';
import { ReadyAnimation } from '@/components/ui/ReadyAnimation';

// ── Transport mode helper (Task 2) ─────────────────────────────────────────
function getTransportModeCfg(mode?: string) {
  if (mode === 'air') return { Icon: Plane, label: 'Air Freight', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' };
  if (mode === 'road') return { Icon: Truck, label: 'Road', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
  return { Icon: Ship, label: 'Ocean Freight', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' };
}

const viewTitles: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  overview: 'Shipment Overview',
  exceptions: 'Exception Workbench',
  documents: 'Document Status',
  communications: 'Communications',
  timeline: 'Resolution Timeline',
  email: 'Email',
};

// ── Navigation history stack (Feature B) ─────────────────────────────────
interface NavState {
  view: ViewId;
  showShipmentList: boolean;
  scenarioId: string;
}

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [activeScenarioId, setActiveScenarioId] = useState(builtInScenarios[0].id);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [activeDrafts, setActiveDrafts] = useState<typeof builtInScenarios[0]['exceptions'][0]['emailDrafts']>([]);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [resolvedExceptions, setResolvedExceptions] = useState<Set<string>>(new Set());
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceOverride, setComplianceOverride] = useState<{ exceptionId: string; documentName: string } | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<'pending' | 'reviewing' | 'approved'>('pending');
  const [showDocPack, setShowDocPack] = useState(false);
  const [tradeSignOff, setTradeSignOff] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showScenarioUpload, setShowScenarioUpload] = useState(false);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [showShipmentList, setShowShipmentList] = useState(true);
  const [inboxEmails, setInboxEmails] = useState<InboxEmail[]>(INITIAL_INBOX_EMAILS);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [inboxHasNewReply, setInboxHasNewReply] = useState(0);
  const [emailSubView, setEmailSubView] = useState<'inbox' | 'sent'>('inbox');
  const [resolvedDocTypes, setResolvedDocTypes] = useState<Set<ResolveDocType>>(new Set());
  const [liveCountdownSecs, setLiveCountdownSecs] = useState<number | null>(null);
  const [showReadyAnim, setShowReadyAnim] = useState(false);
  const readyAnimShownRef = useRef(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Task 3: Track which exception actions have been executed (email sent)
  const [executedActionIds, setExecutedActionIds] = useState<Set<string>>(new Set());
  // Track which actions have received email replies (confirmation)
  const [repliedActionIds, setRepliedActionIds] = useState<Set<string>>(new Set());
  const lastTriggeredActionIdRef = useRef<string | null>(null);
  const replyToActionRef = useRef<Map<string, string>>(new Map());
  const pendingOverrideActionRef = useRef<string | null>(null);
  const sentCounterRef = useRef(0);
  // Feature: Track which AI assessments have been "seen" (thinking animation already played)
  const [seenAssessments, setSeenAssessments] = useState<Set<string>>(new Set());
  // Feature B: Navigation history stack
  const [navStack, setNavStack] = useState<NavState[]>([]);
  // Feature C: Track completed (cleared for handoff) scenarios
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

  const allScenarios = useMemo(() => [...builtInScenarios, ...customScenarios], [customScenarios]);

  const exceptionByShipment = useMemo(() => Object.fromEntries(
    recentExceptions.map((e) => [e.shipment, e])
  ), []);

  const scenarioOptions = useMemo(() => allScenarios.map((s) => {
    const exc = exceptionByShipment[s.shipment.id];
    return {
      id: s.id,
      name: s.name,
      shipmentId: s.shipment.id,
      exceptionStatus: exc?.status,
      severity: exc?.severity,
    };
  }), [allScenarios, exceptionByShipment]);
  const scenario = useMemo(() => allScenarios.find((s) => s.id === activeScenarioId) ?? builtInScenarios[0], [activeScenarioId, allScenarios]);

  const exceptions = useMemo(
    () => scenario.exceptions.map((exc) => ({
      ...exc,
      status: resolvedExceptions.has(exc.id) ? ('resolved' as ExceptionStatus) : exc.status,
    })),
    [scenario.exceptions, resolvedExceptions]
  );

  // Override document statuses based on email-resolved documents or manually resolved exceptions
  const enhancedDocuments = useMemo(() => {
    return scenario.documents.map((doc) => {
      const n = doc.name.toLowerCase();
      // Email AI matching overrides
      if (resolvedDocTypes.has('isf') && (n.includes('importer security') || n.includes('isf'))) {
        return { ...doc, status: 'validated' as const, receivedAt: new Date().toISOString(), source: 'Email — AI Matched' };
      }
      if (resolvedDocTypes.has('invoice') && n.includes('commercial invoice')) {
        return { ...doc, status: 'validated' as const, receivedAt: new Date().toISOString(), source: 'Email — AI Matched' };
      }
      if (resolvedDocTypes.has('invoice') && n.includes('packing list')) {
        return { ...doc, status: 'validated' as const, receivedAt: new Date().toISOString(), source: 'Email — AI Matched' };
      }
      if (resolvedDocTypes.has('msds') && (n.includes('msds') || n.includes('material safety') || n.includes('dangerous goods declaration'))) {
        return { ...doc, status: 'validated' as const, receivedAt: new Date().toISOString(), source: 'Email — AI Matched' };
      }
      if (resolvedDocTypes.has('bol') && (n.includes('bill of lading') || n.includes('bol'))) {
        return { ...doc, status: 'validated' as const, receivedAt: new Date().toISOString(), source: 'Upload — AI Matched' };
      }
      // Manual resolve override: if the exception tied to this document was resolved,
      // treat the document as validated so the gate check can progress
      const hasResolvedExc = scenario.exceptions.some(
        (exc) => resolvedExceptions.has(exc.id) && exc.documentName === doc.name
      );
      if (hasResolvedExc && (doc.status === 'missing' || doc.status === 'mismatch' || doc.status === 'unreadable' || doc.status === 'pending')) {
        return { ...doc, status: 'validated' as const, source: 'Manually Resolved' };
      }
      return doc;
    });
  }, [scenario.documents, scenario.exceptions, resolvedDocTypes, resolvedExceptions]);

  const selectedExc = useMemo(() => exceptions.find((e) => e.id === selectedExceptionId) ?? null, [exceptions, selectedExceptionId]);

  // Helper: is an exception covered by an email-resolved doc type?
  const isResolvedByDocType = useCallback((exc: DocumentException) => {
    const name = exc.documentName.toLowerCase();
    if (resolvedDocTypes.has('isf') && (name.includes('isf') || name.includes('importer security'))) return true;
    if (resolvedDocTypes.has('invoice') && (name.includes('invoice') || name.includes('commercial') || name.includes('packing list'))) return true;
    if (resolvedDocTypes.has('msds') && (name.includes('msds') || name.includes('material safety') || name.includes('dangerous goods'))) return true;
    if (resolvedDocTypes.has('bol') && (name.includes('bill of lading') || name.includes('bol'))) return true;
    if (resolvedDocTypes.has('general')) return true;
    return false;
  }, [resolvedDocTypes]);

  // An exception counts as "open blocking" only if it is both blocking AND not resolved by any means
  const openBlockingCount = useMemo(() =>
    exceptions.filter((e) => e.blocking && e.status !== 'resolved' && !isResolvedByDocType(e)).length,
    [exceptions, isResolvedByDocType]);

  const adjustedReadiness = useMemo(() => {
    const totalBlocking = scenario.exceptions.filter((e) => e.blocking).length;
    // Count as resolved: in resolvedExceptions SET, OR covered by a resolved doc type
    const resolvedBlocking = scenario.exceptions.filter((e) => {
      if (!e.blocking) return false;
      if (resolvedExceptions.has(e.id)) return true;
      const name = e.documentName.toLowerCase();
      if (resolvedDocTypes.has('isf') && (name.includes('isf') || name.includes('importer security'))) return true;
      if (resolvedDocTypes.has('invoice') && (name.includes('invoice') || name.includes('commercial') || name.includes('packing list'))) return true;
      if (resolvedDocTypes.has('msds') && (name.includes('msds') || name.includes('material safety') || name.includes('dangerous goods'))) return true;
      if (resolvedDocTypes.has('bol') && (name.includes('bill of lading') || name.includes('bol'))) return true;
      if (resolvedDocTypes.has('general')) return true; // general doc type covers any remaining exception
      return false;
    }).length;
    if (totalBlocking === 0) return scenario.shipment.readinessScore;
    const boost = (resolvedBlocking / totalBlocking) * (100 - scenario.shipment.readinessScore);
    return Math.round(scenario.shipment.readinessScore + boost);
  }, [scenario, resolvedExceptions, resolvedDocTypes]);

  // Dynamic matching summary — reflects resolved state instead of static scenario data
  const dynamicMatchingSummary = useMemo(() => {
    const received = enhancedDocuments.filter((d) => d.status !== 'missing' && d.status !== 'pending').length;
    const matched = enhancedDocuments.filter((d) => d.status === 'validated').length;
    const exceptionsDetected = exceptions.filter((e) => e.status !== 'resolved' && !isResolvedByDocType(e)).length;
    const blockingIssues = openBlockingCount;
    return {
      totalRequired: scenario.matchingSummary.totalRequired,
      received,
      matched,
      exceptionsDetected,
      blockingIssues,
    };
  }, [enhancedDocuments, exceptions, openBlockingCount, isResolvedByDocType, scenario.matchingSummary.totalRequired]);

  const gates = useMemo(() => {
    const allReceived = enhancedDocuments.every((d) => d.status !== 'missing' && d.status !== 'pending');
    const noBlockers = openBlockingCount === 0;
    const allValid = allReceived && noBlockers;
    return [
      { name: 'Docs Received', status: allReceived ? 'passed' as const : 'active' as const },
      { name: 'Validated', status: allValid ? 'passed' as const : allReceived ? 'blocked' as const : 'locked' as const },
      { name: 'Compliance', status: allValid ? (adjustedReadiness >= 100 ? 'passed' as const : 'active' as const) : 'locked' as const },
      { name: 'Handoff Ready', status: adjustedReadiness >= 100 ? 'passed' as const : 'locked' as const },
    ];
  }, [enhancedDocuments, openBlockingCount, adjustedReadiness]);

  const quickActions = useMemo(() => {
    const actions: { exception: DocumentException; action: ResolutionAction }[] = [];
    for (const exc of exceptions) {
      if (exc.status === 'resolved') continue;
      for (const action of exc.resolutionActions) {
        actions.push({ exception: exc, action });
        if (actions.length >= 5) return actions;
      }
    }
    return actions;
  }, [exceptions]);

  // Dynamic timeline — merge static events with real-time status updates
  const dynamicTimeline = useMemo(() => {
    const events = [...scenario.globalTimeline];
    // Add executed action events
    for (const id of executedActionIds) {
      const exc = scenario.exceptions.find(e => e.resolutionActions.some(a => a.id === id));
      const action = exc?.resolutionActions.find(a => a.id === id);
      if (action && exc) {
        events.push({
          id: `action-${id}`,
          timestamp: new Date().toISOString(),
          description: `Action dispatched: ${action.label} → ${action.target}`,
          type: 'info' as const,
        });
      }
    }
    // Add reply received events
    for (const id of repliedActionIds) {
      const exc = scenario.exceptions.find(e => e.resolutionActions.some(a => a.id === id));
      const action = exc?.resolutionActions.find(a => a.id === id);
      if (action && exc) {
        events.push({
          id: `reply-${id}`,
          timestamp: new Date().toISOString(),
          description: `Reply confirmed: ${action.label} — document received from ${action.target}`,
          type: 'positive' as const,
        });
      }
    }
    // Add resolved exception events
    for (const id of resolvedExceptions) {
      const exc = scenario.exceptions.find(e => e.id === id);
      if (exc) {
        events.push({
          id: `resolved-${id}`,
          timestamp: new Date().toISOString(),
          description: `Exception resolved: ${exc.id} — ${exc.documentName}`,
          type: 'positive' as const,
        });
      }
    }
    return events;
  }, [scenario, executedActionIds, repliedActionIds, resolvedExceptions]);

  // Feature B: Push current nav state before navigating
  const pushNav = useCallback(() => {
    setNavStack(prev => {
      const entry: NavState = { view: activeView, showShipmentList, scenarioId: activeScenarioId };
      const next = [...prev, entry];
      return next.length > 10 ? next.slice(-10) : next;
    });
  }, [activeView, showShipmentList, activeScenarioId]);

  // Feature B: Go back to previous view
  const handleBack = useCallback(() => {
    setNavStack(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const entry = next.pop()!;
      setActiveView(entry.view);
      setShowShipmentList(entry.showShipmentList);
      setActiveScenarioId(entry.scenarioId);
      return next;
    });
  }, []);

  const handleViewChange = useCallback((view: ViewId) => {
    pushNav();
    setActiveView(view);
    // Only the Shipment Overview shows the list page; sub-tabs and other views go direct
    if (view === 'overview') {
      setShowShipmentList(true);
    }
    // Clear inbox badge when navigating to email
    if (view === 'email') {
      setInboxHasNewReply(0);
    }
  }, [pushNav]);

  const handleSelectShipment = useCallback((id: string) => {
    pushNav();
    setActiveScenarioId(id);
    setSelectedExceptionId(null);
    // Feature C: If re-opening a completed scenario, restore all exceptions as resolved
    if (completedScenarios.has(id)) {
      const sc = allScenarios.find(s => s.id === id);
      if (sc) setResolvedExceptions(new Set(sc.exceptions.map(e => e.id)));
    } else {
      setResolvedExceptions(new Set());
      setResolvedDocTypes(new Set());
      setExecutedActionIds(new Set());
      setRepliedActionIds(new Set());
      lastTriggeredActionIdRef.current = null;
      replyToActionRef.current.clear();

      pendingOverrideActionRef.current = null;
    }
    readyAnimShownRef.current = false;
    setShowReadyAnim(false);
    setSeenAssessments(new Set());
    setShowShipmentList(false);
  }, [pushNav, completedScenarios, allScenarios]);

  const handleNavigateToScenario = useCallback((shipmentId: string) => {
    const target = allScenarios.find((s) => s.shipment.id === shipmentId);
    if (!target) return;
    pushNav();
    setActiveScenarioId(target.id);
    setSelectedExceptionId(null);
    setResolvedExceptions(new Set());
    setResolvedDocTypes(new Set());
    setExecutedActionIds(new Set());
    setRepliedActionIds(new Set());
    lastTriggeredActionIdRef.current = null;
    replyToActionRef.current.clear();

    pendingOverrideActionRef.current = null;
    setShowShipmentList(false);
    setActiveView('overview');
  }, [allScenarios, pushNav]);

  const handleScenarioChange = useCallback((id: string) => {
    setActiveScenarioId(id);
    setSelectedExceptionId(null);
    setShowDraftPanel(false);
    setShowEscalationModal(false);
    setResolvedExceptions(new Set());
    setActiveView((prev) => (prev === 'dashboard' || prev === 'analytics') ? prev : 'overview');
    setShowComplianceModal(false);
    setComplianceOverride(null);
    setComplianceStatus('pending');
    setShowDocPack(false);
    setTradeSignOff(false);
    setShowAiPanel(false);
    setShowShipmentList(false);
    setInboxEmails(INITIAL_INBOX_EMAILS);
    setSentEmails([]);
    setInboxHasNewReply(0);
    setEmailSubView('inbox');
    setResolvedDocTypes(new Set());
    setShowReadyAnim(false);
    readyAnimShownRef.current = false;
    setExecutedActionIds(new Set());
    setRepliedActionIds(new Set());
    setNavStack([]); // Feature B: full reset clears history
    lastTriggeredActionIdRef.current = null;
    replyToActionRef.current.clear();

    pendingOverrideActionRef.current = null;
  }, []);

  const handleActionForException = useCallback((exc: DocumentException, actionId: string) => {
    const action = exc.resolutionActions.find((a) => a.id === actionId);
    if (!action) return;
    if (action.type === 'internal') {
      // Internal actions auto-confirm — no email exchange needed
      setExecutedActionIds((prev) => new Set([...prev, actionId]));
      setTimeout(() => {
        setRepliedActionIds((prev) => new Set([...prev, actionId]));
        toast.success(`Internal action confirmed: ${action.label}`);
      }, 800);
      return;
    }
    if (action.type === 'email') {
      lastTriggeredActionIdRef.current = actionId;
      setExecutedActionIds((prev) => new Set([...prev, actionId]));
      setActiveDrafts(exc.emailDrafts);
      setShowDraftPanel(true);
    } else if (action.type === 'escalation') {
      setShowEscalationModal(true);
      setExecutedActionIds((prev) => new Set([...prev, actionId]));
    } else if (action.type === 'override') {
      setComplianceOverride({ exceptionId: exc.id, documentName: exc.documentName });
      setComplianceStatus('pending');
      setShowComplianceModal(true);
      setExecutedActionIds((prev) => new Set([...prev, actionId]));
      // Track this actionId so we can confirm it when the modal completes
      pendingOverrideActionRef.current = actionId;
    }
  }, []);

  const handleAction = useCallback((actionId: string) => {
    if (!selectedExc) return;
    handleActionForException(selectedExc, actionId);
  }, [selectedExc, handleActionForException]);

  const handleResolve = useCallback(() => {
    if (!selectedExceptionId) return;
    setResolvedExceptions((prev) => new Set([...prev, selectedExceptionId]));
    setSelectedExceptionId(null);
    toast.success('Exception marked as resolved. Readiness score updated.');
  }, [selectedExceptionId]);

  const handleSendDraft = useCallback((tab: string, editedSubject?: string, editedBody?: string, passedDraft?: typeof activeDrafts[0], directActionId?: string) => {
    // Use directActionId if passed (batch Execute All), else fall back to ref (single Execute click)
    const actionId = directActionId ?? lastTriggeredActionIdRef.current;
    lastTriggeredActionIdRef.current = null;

    const draft = passedDraft ?? activeDrafts.find((d) => d.tab === tab);
    if (draft) {
      const finalDraft = {
        ...draft,
        subject: editedSubject ?? draft.subject,
        body: editedBody ?? draft.body,
      };
      const sentId = `sent-${Date.now()}-${sentCounterRef.current++}`;
      setSentEmails((prev) => [
        ...prev,
        { id: sentId, timestamp: new Date().toISOString(), draft: finalDraft },
      ]);
      // Simulate reply after 2 seconds — reply tracked per-action, NO auto-resolve
      setTimeout(() => {
        const reply = generateReply(finalDraft);
        setInboxEmails((prev) => [reply, ...prev]);
        setInboxHasNewReply((prev) => prev + 1);
        // Store mapping: reply email ID → action ID (confirmed when user opens reply)
        if (actionId) {
          replyToActionRef.current.set(reply.id, actionId);
        }
        // Document status + action confirmation happen ONLY when user opens the reply in inbox
        // (see onReadReply callback) — NOT here automatically
      }, 2000);
    }
    toast.success(`Email sent to ${tab}`);
  }, [activeDrafts]);

  // Task 3: Send All — defined AFTER handleSendDraft to avoid TDZ error
  const handleExecuteAll = useCallback(() => {
    if (!selectedExc) return;
    const allIds = selectedExc.resolutionActions.map((a) => a.id);
    setExecutedActionIds((prev) => new Set([...prev, ...allIds]));
    // Match each action to its draft and set ref before each send
    selectedExc.resolutionActions.forEach((action) => {
      // Internal actions auto-confirm immediately
      if (action.type === 'internal') {
        setTimeout(() => {
          setRepliedActionIds((prev) => new Set([...prev, action.id]));
        }, 800);
        return;
      }
      // Escalation actions auto-confirm (modal not needed in Send All flow)
      if (action.type === 'escalation') {
        setTimeout(() => {
          setRepliedActionIds((prev) => new Set([...prev, action.id]));
          toast.success(`Escalation confirmed: ${action.label}`);
        }, 1200);
        return;
      }
      if (action.type !== 'email') return;
      const draft = selectedExc.emailDrafts.find((d) => d.to === action.target || d.tab === action.target);
      if (!draft) return;
      handleSendDraft(draft.tab, draft.subject, draft.body, draft, action.id);
    });
    toast.success('All actions dispatched — awaiting document confirmation.');
  }, [selectedExc, handleSendDraft]);

  // Quick Actions "Execute All" — batch-execute non-escalation actions from Overview page
  const handleQuickExecuteAll = useCallback(() => {
    const pending = quickActions.filter(
      ({ action }) => action.type !== 'escalation' && !executedActionIds.has(action.id)
    );
    if (pending.length === 0) return;

    // Mark all pending as executed
    const ids = pending.map(({ action }) => action.id);
    setExecutedActionIds((prev) => new Set([...prev, ...ids]));

    // Process by type
    pending.forEach(({ exception: exc, action }) => {
      if (action.type === 'internal') {
        setTimeout(() => {
          setRepliedActionIds((prev) => new Set([...prev, action.id]));
          toast.success(`Internal action confirmed: ${action.label}`);
        }, 800);
        return;
      }
      if (action.type === 'override') {
        setComplianceOverride({ exceptionId: exc.id, documentName: exc.documentName });
        setComplianceStatus('pending');
        setShowComplianceModal(true);
        pendingOverrideActionRef.current = action.id;
        return;
      }
      if (action.type === 'email') {
        const draft = exc.emailDrafts.find((d) => d.to === action.target || d.tab === action.target);
        if (draft) {
          handleSendDraft(draft.tab, draft.subject, draft.body, draft, action.id);
        }
      }
    });
    toast.success('All actions dispatched — awaiting confirmation.');
  }, [quickActions, executedActionIds, handleSendDraft]);

  // Unified escalation approval handler — called when human approves an AI-recommended action
  const handleApproveEscalation = useCallback((option: ActionOption) => {
    setShowEscalationModal(false);

    // Build stakeholder notification drafts
    const drafts = [
      {
        tab: 'Carrier Notification',
        to: 'bookings.sha@maersk.com',
        subject: `Action Approved - ${scenario.shipment.id} - ${option.label}`,
        body: `Dear Maersk Booking Team,\n\nWe have approved the following escalation action for shipment ${scenario.shipment.id}:\n\nApproved Action: ${option.label}\n${option.description}\n\nExpected Resolution: ${option.resolveTime}\nCost Impact: ${option.cost}\nDelay Impact: ${option.delay}\n\nPlease confirm receipt and provide acknowledgement at your earliest convenience.\n\nRegards,\nDG Documentation Team\nGlobal Forwarding LLC`,
      },
      {
        tab: 'Customer Advisory',
        to: 'supply.chain@techretail.com',
        subject: `Shipment Update - ${scenario.shipment.id} - Escalation Action Initiated`,
        body: `Dear TechRetail Supply Chain Team,\n\nWe are writing to inform you that we have initiated an escalation action for your shipment PO-2024-8894 (${scenario.shipment.id}).\n\nAction Taken: ${option.label}\n${option.description}\n\nExpected Resolution Timeline: ${option.resolveTime}\nDelay Impact: ${option.delay}\n\nWe will provide updated tracking details as this progresses.\n\nBest regards,\nExport Operations\nGlobal Forwarding LLC`,
      },
      {
        tab: 'Ops Coordination',
        to: 'ops.director@globalforwarding.com',
        subject: `ACTION APPROVED - ${scenario.shipment.id} - ${option.label}`,
        body: `Internal Notification — Escalation Action Approved\n\nShipment: ${scenario.shipment.id}\nApproved Action: ${option.label}\nCost Impact: ${option.cost}\nDelay Impact: ${option.delay}\nExpected Resolution: ${option.resolveTime}\n\nAction Required:\n- Update all downstream systems\n- Notify warehouse receiving team at destination\n- Confirm with carrier within 2 hours\n\nDecision logged to audit trail.\n\nRegards,\nExport Coordination`,
      },
    ];

    setActiveDrafts(drafts);
    setShowDraftPanel(true);

    // Resolve exceptions: if a specific exception is selected, resolve it;
    // otherwise (e.g. Risk Banner war room), resolve all unresolved exceptions
    if (selectedExc) {
      const allIds = selectedExc.resolutionActions.map((a) => a.id);
      setExecutedActionIds((prev) => new Set([...prev, ...allIds]));
      setRepliedActionIds((prev) => new Set([...prev, ...allIds]));
      setResolvedExceptions((prev) => new Set([...prev, selectedExc.id]));
    } else {
      const unresolvedExcs = exceptions.filter((e) => e.status !== 'resolved');
      const allIds = unresolvedExcs.flatMap((e) => e.resolutionActions.map((a) => a.id));
      const allExcIds = unresolvedExcs.map((e) => e.id);
      setExecutedActionIds((prev) => new Set([...prev, ...allIds]));
      setRepliedActionIds((prev) => new Set([...prev, ...allIds]));
      setResolvedExceptions((prev) => new Set([...prev, ...allExcIds]));
    }

    toast.success(`Action approved: ${option.label}`);
  }, [scenario, selectedExc, exceptions]);
  const buildAiReasoning = useCallback((): AiReasoning => {
    const criticalExcs = exceptions.filter((e) => e.severity === 'critical' && e.status !== 'resolved');
    const hoursLeft = scenario.shipment.cutoffHours;
    const triggerDoc = criticalExcs.length > 0 ? criticalExcs[0].documentName : null;
    return {
      triggerSummary: triggerDoc
        ? `${triggerDoc} — ${criticalExcs.length} critical exception${criticalExcs.length > 1 ? 's' : ''} with only ${hoursLeft}h to vessel cutoff`
        : `Shipment ${scenario.shipment.id} at risk — ${hoursLeft}h to vessel cutoff`,
      attemptsMade: [
        { time: '08:15', action: 'Automated reminder → Freight Forwarder', outcome: 'No response (2h elapsed)' },
        { time: '09:45', action: 'System chase → Carrier booking desk', outcome: 'Response pending' },
        { time: '10:30', action: 'Secondary forwarder contacted (backup)', outcome: 'Awaiting confirmation' },
      ],
      whyHuman:
        'All automated resolution channels have been exhausted without a successful outcome. SLA breach is imminent and only human authority can approve the emergency escalation pathway.',
      riskFactors: [
        {
          label: 'Customs compliance',
          level: 'critical',
          detail: hoursLeft <= 4 ? `CBP cargo hold imminent — ISF window closing` : `CBP regulatory risk if unresolved before cutoff`,
        },
        {
          label: 'Vessel departure',
          level: 'critical',
          detail: `${hoursLeft}h remaining — carrier cannot guarantee extensions`,
        },
        {
          label: 'Customer SLA',
          level: 'high',
          detail: 'Delivery commitment at risk, contractual penalty clause active',
        },
      ],
    };
  }, [scenario, exceptions]);

  const handleRiskEscalate = useCallback(() => {
    setShowEscalationModal(true);
  }, []);

  const handleImportScenario = useCallback((sc: Scenario) => {
    setCustomScenarios((prev) => [...prev, sc]);
    setActiveScenarioId(sc.id);
    setSelectedExceptionId(null);
    setResolvedExceptions(new Set());
    setActiveView('overview');
    setShowShipmentList(false);
    toast.success(`Scenario "${sc.name}" imported successfully.`);
  }, []);

  const handleOpenDraft = useCallback(() => {
    const firstUnresolved = exceptions.find((e) => e.status !== 'resolved' && e.emailDrafts.length > 0);
    if (firstUnresolved) {
      setActiveDrafts(firstUnresolved.emailDrafts);
      setShowDraftPanel(true);
    }
  }, [exceptions]);

  // Resolve exceptions when a document is uploaded and AI-validated
  const handleUploadComplete = useCallback((uploadedFileName: string) => {
    const n = uploadedFileName.toLowerCase();
    let docType: ResolveDocType | null = null;
    if (n.includes('isf') || n.includes('importer')) docType = 'isf';
    else if (n.includes('bol') || n.includes('lading')) docType = 'bol';
    else if (n.includes('invoice')) docType = 'invoice';
    else if (n.includes('msds') || n.includes('material')) docType = 'msds';
    else docType = 'general';

    if (docType) setResolvedDocTypes((prev) => new Set([...prev, docType!]));

    // Find and directly resolve all matching open exceptions
    const matchingExcs = scenario.exceptions.filter((exc) => {
      if (resolvedExceptions.has(exc.id)) return false;
      const name = exc.documentName.toLowerCase();
      if (docType === 'isf') return name.includes('isf') || name.includes('importer security');
      if (docType === 'bol') return name.includes('bill of lading') || name.includes('bol');
      if (docType === 'invoice') return name.includes('invoice') || name.includes('commercial');
      if (docType === 'msds') return name.includes('msds') || name.includes('material safety');
      return true;
    });

    matchingExcs.forEach((exc) => {
      const allIds = exc.resolutionActions.map((a) => a.id);
      setExecutedActionIds((prev) => new Set([...prev, ...allIds]));
      setRepliedActionIds((prev) => new Set([...prev, ...allIds]));
      setResolvedExceptions((prev) => new Set([...prev, exc.id]));
      toast.success(`${exc.documentName} — uploaded & AI-validated. Exception resolved.`);
    });

    if (matchingExcs.length === 0) {
      toast.success(`${uploadedFileName} — document processed and matched.`);
    }
  }, [scenario.exceptions, resolvedExceptions]);

  // Clear inbox notification when user navigates to email inbox
  useEffect(() => {
    if (activeView === 'email' && emailSubView === 'inbox') {
      setInboxHasNewReply(0);
    }
  }, [activeView, emailSubView]);

  const isWarRoom = scenario.warRoom;

  // Live countdown timer — ticks every second when in War Room
  useEffect(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (isWarRoom) {
      const startSecs = Math.round(scenario.shipment.cutoffHours * 3600);
      const startTime = Date.now();
      setLiveCountdownSecs(startSecs);
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, startSecs - elapsed);
        setLiveCountdownSecs(remaining);
      }, 1000);
    } else {
      setLiveCountdownSecs(null);
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWarRoom, scenario.shipment.id]);

  const receivedCount = enhancedDocuments.filter((d) => d.status !== 'missing' && d.status !== 'pending').length;

  // Auto-navigate from Documents → Overview when readiness reaches 100%
  useEffect(() => {
    if (activeView === 'documents' && adjustedReadiness >= 100 && !showShipmentList) {
      const timer = setTimeout(() => {
        pushNav();
        setActiveView('overview');
        toast.info('Readiness 100% — navigating to Shipment Overview.');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeView, adjustedReadiness, showShipmentList, pushNav]);

  // Auto-resolve exceptions when all relevant actions are confirmed
  // Escalation actions that were intentionally skipped (never executed) are treated as "ok"
  // so they don't block resolution when user chose Execute All which skips them
  useEffect(() => {
    scenario.exceptions.forEach((exc) => {
      if (resolvedExceptions.has(exc.id)) return; // already resolved
      if (exc.resolutionActions.length === 0) return; // no actions to confirm
      // Must have at least one executed action before auto-resolving
      const hasAnyExecuted = exc.resolutionActions.some((a) => executedActionIds.has(a.id));
      if (!hasAnyExecuted) return;
      // Each action is "confirmed" if: (a) reply was received, OR (b) it's an escalation/override
      // that was never executed (intentionally skipped by Execute All)
      const allConfirmed = exc.resolutionActions.every(
        (a) => repliedActionIds.has(a.id) || (
          (a.type === 'escalation' || a.type === 'override') && !executedActionIds.has(a.id)
        )
      );
      if (allConfirmed) {
        setResolvedExceptions((prev) => new Set([...prev, exc.id]));
        toast.success(`${exc.documentName} — all actions confirmed, exception resolved.`);
      }
    });
  }, [scenario.exceptions, repliedActionIds, resolvedExceptions, executedActionIds]);

  // Trigger happy path: all exceptions resolved → navigate to overview → 2s pause → animation
  useEffect(() => {
    const allExceptionsResolved =
      scenario.exceptions.length > 0 &&
      scenario.exceptions.every((e) => resolvedExceptions.has(e.id));
    if (!allExceptionsResolved || showShipmentList || readyAnimShownRef.current) return;
    // Don't auto-navigate from email view — user must manually click "View Updated Document Status"
    // to go to Documents → which auto-navigates to Overview where happy path triggers
    const isBlockedView = activeView === 'dashboard' || activeView === 'analytics' || activeView === 'email';
    if (isBlockedView) return;

    // Step 1: Navigate to Shipment Overview if not already there (from exceptions/documents/etc.)
    if (activeView !== 'overview') {
      setActiveView('overview');
      toast.info('All exceptions resolved — navigating to Shipment Overview.');
      return; // wait for re-render on overview before showing animation
    }
    // Step 2: On overview — pause 2s then show ready animation
    readyAnimShownRef.current = true;
    const timer = setTimeout(() => setShowReadyAnim(true), 2000);
    return () => clearTimeout(timer);
  }, [scenario, resolvedExceptions, showShipmentList, activeView]);

  // Feature C: Handle handoff completion — dismiss anim, mark scenario done, navigate to list
  const handleHandoffComplete = useCallback(() => {
    setShowReadyAnim(false);
    setCompletedScenarios(prev => new Set([...prev, activeScenarioId]));
    setShowShipmentList(true);
    setActiveView('overview');
    setNavStack([]); // clear history — we're resetting to list
    toast.success(`${scenario.shipment.id} cleared for handoff.`);
  }, [activeScenarioId, scenario]);

  // Feature C: Auto-dismiss ready animation after 3 seconds
  useEffect(() => {
    if (!showReadyAnim) return;
    const timer = setTimeout(handleHandoffComplete, 3000);
    return () => clearTimeout(timer);
  }, [showReadyAnim, handleHandoffComplete]);

  // Format live countdown seconds as H:MM:SS
  const formatLiveSecs = (secs: number): string => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const countdownDisplay = isWarRoom && liveCountdownSecs !== null
    ? formatLiveSecs(liveCountdownSecs)
    : formatCountdown(scenario.shipment.cutoffHours);

  const severityBadgeVariant = (sev: string) => {
    if (sev === 'critical') return 'critical' as const;
    if (sev === 'high') return 'high' as const;
    if (sev === 'medium') return 'medium' as const;
    return 'low' as const;
  };

  // Show login page if no role selected
  if (!activeRole) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen"
      >
        <LoginPage onLogin={(role) => setActiveRole(role)} />
      </motion.div>
    );
  }

  return (
    <div className={cn('flex h-screen overflow-hidden', isWarRoom && 'war-room')}>
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        exceptionCount={exceptions.filter((e) => e.status !== 'resolved').length}
        shipmentId={scenario.shipment.id}
        shipmentStatus={isWarRoom ? 'blocked' : scenario.shipment.status}
        cutoffHours={scenario.shipment.cutoffHours}
        readinessPercent={adjustedReadiness}
        inboxHasReply={inboxHasNewReply}
        emailSubView={emailSubView}
        onEmailSubViewChange={(v) => {
          setEmailSubView(v);
          setActiveView('email');
        }}
        userRole={activeRole ?? undefined}
        onLogout={() => setActiveRole(null)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={viewTitles[activeView]}
          scenarios={scenarioOptions}
          activeScenario={activeScenarioId}
          onScenarioChange={handleScenarioChange}
          shipmentId={scenario.shipment.id}
          shipmentStatus={isWarRoom ? 'blocked' : scenario.shipment.status}
          onAiToggle={() => setShowAiPanel((prev) => !prev)}
          aiPanelOpen={showAiPanel}
          onImportScenario={() => setShowScenarioUpload(true)}
          showScenarios={
            !showShipmentList &&
            activeView !== 'dashboard' &&
            activeView !== 'analytics' &&
            activeView !== 'email'
          }
        />

        {isWarRoom && activeView !== 'dashboard' && activeView !== 'analytics' && activeView !== 'email' && !showShipmentList && (
          <RiskBanner
            shipmentId={scenario.shipment.id}
            blockerCount={openBlockingCount}
            hoursRemaining={scenario.shipment.cutoffHours}
            countdownDisplay={countdownDisplay}
            issues={exceptions.filter((e) => e.blocking && e.status !== 'resolved').map((e) => e.summary.split('.')[0])}
            onEscalate={handleRiskEscalate}
          />
        )}

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4">

          {/* Feature B: Universal back button — visible on ALL views when history exists */}
          {navStack.length > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group mb-2"
            >
              <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
          )}

          {/* DASHBOARD */}
          {activeView === 'dashboard' && <DashboardView onNavigateToScenario={handleNavigateToScenario} />}

          {/* ANALYTICS */}
          {activeView === 'analytics' && <AnalyticsView />}

          {/* EMAIL */}
          {activeView === 'email' && (
            <EmailView
              subView={emailSubView}
              onSubViewChange={(v) => {
                setEmailSubView(v);
              }}
              inboxEmails={inboxEmails}
              sentEmails={sentEmails}
              onMarkRead={(id) =>
                setInboxEmails((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, read: true } : e))
                )
              }
              onReadReply={(emailId) => {
                // Confirm the action linked to this reply
                const actionId = replyToActionRef.current.get(emailId);
                if (actionId) {
                  setRepliedActionIds((prev) => new Set([...prev, actionId]));
                }
                // Update document status based on the reply's doc type
                const replyEmail = inboxEmails.find((e) => e.id === emailId);
                if (replyEmail?.resolveDocType) {
                  setResolvedDocTypes((prev) => new Set([...prev, replyEmail.resolveDocType!]));
                }
              }}
              onNavigateDocuments={() => {
                setActiveView('documents');
                setShowShipmentList(false);
              }}
            />
          )}

          {/* SHIPMENT VIEWS — List */}
          {activeView !== 'dashboard' && activeView !== 'analytics' && activeView !== 'email' && showShipmentList && (
            <ShipmentListView
              scenarios={allScenarios}
              resolvedExceptions={resolvedExceptions}
              completedScenarios={completedScenarios}
              onSelect={handleSelectShipment}
            />
          )}

          {/* SHIPMENT VIEWS — Detail */}
          {activeView !== 'dashboard' && activeView !== 'analytics' && activeView !== 'email' && !showShipmentList && (
            <div className="space-y-3">

              {/* OVERVIEW — Command Center */}
              {activeView === 'overview' && (
                <div className="space-y-2">
                  {scenario.hazmat && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <Flame className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-orange-700">Dangerous Goods Shipment</span>
                          <span className="rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-800">{scenario.hazmat.dgClass}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">UN {scenario.hazmat.unNumber} — {scenario.hazmat.properShippingName}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">Requires MSDS + DG Declaration + Trade Compliance sign-off before handoff</p>
                      </div>
                    </div>
                  )}

                  {/* Row 1: Command Header */}
                  <Card className="rounded-lg shadow-sm">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-bold font-mono text-foreground">{scenario.shipment.id}</code>
                          <Badge variant={severityBadgeVariant(scenario.shipment.status === 'on-track' ? 'resolved' : scenario.shipment.status === 'at-risk' ? 'medium' : 'critical')}>
                            <span className={cn('h-1.5 w-1.5 rounded-full mr-1', scenario.shipment.status === 'on-track' ? 'bg-green-500' : scenario.shipment.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500')} />
                            {scenario.shipment.status === 'on-track' ? 'On Track' : scenario.shipment.status === 'at-risk' ? 'At Risk' : 'Blocked'}
                          </Badge>
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {/* Transport mode badge — Task 2 */}
                          {(() => {
                            const modeCfg = getTransportModeCfg(scenario.shipment.mode);
                            const ModeIcon = modeCfg.Icon;
                            return (
                              <span className={cn('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold shrink-0', modeCfg.bg, modeCfg.border, modeCfg.color)}>
                                <ModeIcon className="h-3 w-3" />
                                {modeCfg.label}
                              </span>
                            );
                          })()}
                          <span className="font-medium text-foreground">{scenario.shipment.origin.port}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                          <span className="font-medium text-foreground">{scenario.shipment.destination.port}</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>{scenario.shipment.carrier} / {scenario.shipment.vessel} / {scenario.shipment.voyage}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className={cn('font-bold tabular-nums font-mono', isWarRoom ? 'text-base' : 'text-lg', getCutoffColor(scenario.shipment.cutoffHours))}>
                              {countdownDisplay}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">to cutoff</span>
                          </div>
                          <Separator orientation="vertical" className="h-6" />
                          <div className="flex items-center gap-1.5">
                            <span className={cn('text-lg font-bold tabular-nums', adjustedReadiness >= 90 ? 'text-green-600' : adjustedReadiness >= 70 ? 'text-amber-600' : 'text-red-600')}>
                              {adjustedReadiness}%
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">ready</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Row 2: Docs + Matching */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8 space-y-2">
                      <RequiredDocsChecklist documents={enhancedDocuments} laneRequirements={scenario.laneRequirements} />
                      <DocumentUploadZone compact onUploadComplete={handleUploadComplete} />
                    </div>
                    <div className="col-span-4 space-y-2">
                      <MatchingSummaryCard summary={dynamicMatchingSummary} />
                      <Card className="rounded-lg shadow-sm">
                        <CardHeader className="border-b border-border">
                          <CardTitle>Gate Check</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <GateCheck gates={gates} />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Row 3: Exceptions + Quick Actions + Timeline */}
                  <div className="grid grid-cols-12 gap-2">
                    {/* Active Exceptions */}
                    <div className="col-span-5">
                      <Card className="rounded-lg shadow-sm h-full">
                        <CardHeader className="border-b border-border">
                          <CardTitle>Active Exceptions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          {exceptions.filter((e) => e.status !== 'resolved').length === 0 ? (
                            <div className="text-center py-6">
                              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              </div>
                              <p className="text-sm font-medium text-green-700">All exceptions resolved</p>
                              <p className="text-xs text-muted-foreground mt-1">Document handoff pack is ready</p>
                              {scenario.hazmat && !tradeSignOff ? (
                                <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700 text-white gap-1.5" onClick={() => setTradeSignOff(true)}>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Trade Compliance Sign-Off
                                </Button>
                              ) : (
                                <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700 text-white gap-1.5" onClick={() => setShowDocPack(true)}>
                                  <Package className="w-3.5 h-3.5" />
                                  Assemble Final Doc Pack
                                </Button>
                              )}
                              {tradeSignOff && scenario.hazmat && (
                                <div className="mt-2 rounded-md bg-purple-50 border border-purple-200 px-3 py-2 text-left">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                    <span className="text-[10px] font-semibold uppercase text-purple-600">Trade Compliance Confirmed</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">DG Class 3 documentation reviewed and approved. MSDS, DG Declaration, and IMDG compliance verified.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {exceptions.filter((e) => e.status !== 'resolved').slice(0, 4).map((exc) => (
                                <button
                                  key={exc.id}
                                  className="w-full text-left p-2.5 rounded-md border border-border hover:border-ring/50 hover:bg-muted/30 transition-all"
                                  onClick={() => { setActiveView('exceptions'); setSelectedExceptionId(exc.id); }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-foreground">{exc.documentName}</span>
                                    <Badge variant={severityBadgeVariant(exc.severity)} className="text-[10px]">{exc.severity}</Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{exc.summary}</p>
                                </button>
                              ))}
                            </div>
                          )}
                          {exceptions.filter((e) => e.status !== 'resolved').length > 0 && (
                            <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={() => setActiveView('exceptions')}>
                              View All Exceptions
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="col-span-4">
                      <Card className="rounded-lg shadow-sm h-full">
                        <CardHeader className="border-b border-border">
                          <div className="flex items-center justify-between">
                            <CardTitle>Quick Actions</CardTitle>
                            {quickActions.filter(({ action }) => action.type !== 'escalation' && !executedActionIds.has(action.id)).length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                onClick={handleQuickExecuteAll}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Execute All
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3">
                          {quickActions.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">No pending actions</p>
                          ) : (
                            <div className="space-y-1.5">
                              {quickActions.map(({ exception: exc, action }) => {
                                const cfg = actionConfig[action.type];
                                const Icon = cfg.icon;
                                const isExecuted = executedActionIds.has(action.id);
                                const isReplied = repliedActionIds.has(action.id);
                                return (
                                  <div key={`${exc.id}-${action.id}`} className={cn('rounded-md border p-2', isReplied ? 'border-emerald-300 bg-emerald-50/40' : isExecuted ? 'border-amber-300 bg-amber-50/40' : cfg.border, !isExecuted && !isReplied && cfg.bg)}>
                                    <div className="flex items-start gap-2">
                                      <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', isReplied ? 'text-emerald-600' : isExecuted ? 'text-amber-600' : cfg.accent)} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">{action.label}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{exc.documentName} → {action.target}</p>
                                      </div>
                                      {isReplied ? (
                                        <span className="shrink-0 h-6 px-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded flex items-center gap-1">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Confirmed
                                        </span>
                                      ) : isExecuted ? (
                                        <span className="shrink-0 h-6 px-2 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded flex items-center gap-1">
                                          <Clock className="h-3 w-3 animate-pulse" />
                                          Pending
                                        </span>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={cn('shrink-0 h-6 px-2 text-[10px] font-medium', cfg.btnBg, cfg.btnText)}
                                          onClick={() => handleActionForException(exc, action.id)}
                                        >
                                          Execute
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Mini Timeline */}
                    <div className="col-span-3">
                      <Card className="rounded-lg shadow-sm h-full">
                        <CardHeader className="border-b border-border">
                          <CardTitle>Recent Events</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3 max-h-[220px] overflow-y-auto">
                          {dynamicTimeline.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">No events yet</p>
                          ) : (
                            <ResolutionTimeline events={dynamicTimeline.slice(-6)} />
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Row 4: Human-in-the-Loop */}
                  <HitlPanel
                    exceptions={exceptions}
                    scenario={scenario}
                    tradeSignOff={tradeSignOff}
                    onEscalate={handleRiskEscalate}
                    onComplianceOverride={(exceptionId, documentName) => {
                      setComplianceOverride({ exceptionId, documentName });
                      setShowComplianceModal(true);
                    }}
                    onTradeSignOff={() => setTradeSignOff(true)}
                  />
                </div>
              )}

              {/* EXCEPTIONS */}
              {activeView === 'exceptions' && (
                <div className="space-y-3">
                  <Card className="rounded-lg shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                      <h3 className="text-sm font-semibold text-foreground">Exception Workbench</h3>
                      <div className="flex items-center gap-4">
                        {[
                          { label: 'Total', value: exceptions.length, color: 'text-foreground' },
                          { label: 'Critical', value: exceptions.filter((e) => e.severity === 'critical' && e.status !== 'resolved').length, color: 'text-red-600' },
                          { label: 'High', value: exceptions.filter((e) => e.severity === 'high' && e.status !== 'resolved').length, color: 'text-orange-600' },
                          { label: 'Blocking', value: openBlockingCount, color: 'text-red-600' },
                          { label: 'Resolved', value: exceptions.filter((e) => e.status === 'resolved').length, color: 'text-green-600' },
                        ].map((stat) => (
                          <div key={stat.label} className="text-xs">
                            <span className="text-muted-foreground">{stat.label}: </span>
                            <span className={cn('font-semibold', stat.color)}>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ExceptionTable exceptions={exceptions} selectedId={selectedExceptionId} onSelect={(id) => setSelectedExceptionId(id)} />
                  </Card>
                  {dynamicTimeline.length > 0 && (
                    <Card className="rounded-lg shadow-sm">
                      <div className="border-b border-border px-4 py-2.5">
                        <h3 className="text-sm font-semibold text-foreground">Resolution History</h3>
                      </div>
                      <CardContent className="pt-3">
                        <ResolutionTimeline events={dynamicTimeline} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* DOCUMENTS */}
              {activeView === 'documents' && (
                <div className="space-y-3">
                  {/* Shipment info strip with transport mode */}
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2">
                    <code className="text-xs font-bold font-mono text-foreground">{scenario.shipment.id}</code>
                    {(() => {
                      const modeCfg = getTransportModeCfg(scenario.shipment.mode);
                      const ModeIcon = modeCfg.Icon;
                      return (
                        <span className={cn('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold shrink-0', modeCfg.bg, modeCfg.border, modeCfg.color)}>
                          <ModeIcon className="h-3 w-3" />
                          {modeCfg.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-muted-foreground">
                      {scenario.shipment.origin.port} → {scenario.shipment.destination.port}
                    </span>
                    <span className="text-xs text-muted-foreground/50">|</span>
                    <span className="text-xs text-muted-foreground">{scenario.shipment.carrier} / {scenario.shipment.vessel}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-8">
                      <RequiredDocsChecklist documents={enhancedDocuments} laneRequirements={scenario.laneRequirements} />
                    </div>
                    <div className="col-span-4 space-y-3">
                      <MatchingSummaryCard summary={dynamicMatchingSummary} />
                      <ReadinessScore score={adjustedReadiness} label={`${receivedCount} of ${enhancedDocuments.length} documents`} large />
                    </div>
                  </div>
                  <DocumentUploadZone onUploadComplete={handleUploadComplete} />
                  <Card className="rounded-lg shadow-sm">
                    <CardHeader className="border-b border-border">
                      <CardTitle>Gate Check</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <GateCheck gates={gates} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* COMMUNICATIONS */}
              {activeView === 'communications' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    AI-generated communications for active exceptions. Review before sending.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {exceptions.filter((e) => e.status !== 'resolved').flatMap((exc) =>
                      exc.emailDrafts.map((draft, i) => (
                        <div key={`${exc.id}-${i}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={severityBadgeVariant(exc.severity)}>{exc.severity}</Badge>
                            <span className="text-xs text-muted-foreground">{exc.id} — {exc.documentName}</span>
                          </div>
                          <EmailPreview draft={draft} />
                        </div>
                      ))
                    )}
                  </div>
                  {exceptions.filter((e) => e.status !== 'resolved').length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <p className="text-sm">No active exceptions. All communications resolved.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TIMELINE */}
              {activeView === 'timeline' && (
                <Card className="rounded-lg shadow-sm">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <h3 className="text-sm font-semibold text-foreground">Resolution Timeline</h3>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground"><span className="font-semibold text-foreground">{dynamicTimeline.length}</span> events</span>
                      {dynamicTimeline.filter((e) => e.type === 'critical').length > 0 && (
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /><span className="font-medium text-red-600">{dynamicTimeline.filter((e) => e.type === 'critical').length} critical</span></span>
                      )}
                      {dynamicTimeline.filter((e) => e.type === 'warning').length > 0 && (
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /><span className="font-medium text-amber-600">{dynamicTimeline.filter((e) => e.type === 'warning').length} warnings</span></span>
                      )}
                      {dynamicTimeline.filter((e) => e.type === 'positive').length > 0 && (
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="font-medium text-green-600">{dynamicTimeline.filter((e) => e.type === 'positive').length} resolved</span></span>
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-3">
                    <ResolutionTimeline events={dynamicTimeline} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Panel */}
      <AiChatPanel
        isOpen={showAiPanel}
        onClose={() => setShowAiPanel(false)}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view as ViewId)}
        onEscalate={handleRiskEscalate}
        onOpenDraft={handleOpenDraft}
      />

      {/* Exception Detail Panel */}
      <AnimatePresence>
        {selectedExc && (
          <ExceptionDetailPanel
            exception={selectedExc}
            onClose={() => setSelectedExceptionId(null)}
            onAction={handleAction}
            onResolve={handleResolve}
            executedActionIds={executedActionIds}
            repliedActionIds={repliedActionIds}
            onExecuteAll={handleExecuteAll}
            hasSeenAssessment={seenAssessments.has(selectedExc.id)}
            onAssessmentSeen={(id) => setSeenAssessments(prev => new Set([...prev, id]))}
          />
        )}
      </AnimatePresence>

      {/* Communication Draft Panel */}
      <AnimatePresence>
        {showDraftPanel && activeDrafts.length > 0 && (
          <>
            <motion.div key="draft-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowDraftPanel(false)} />
            <motion.div key="draft-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[480px] border-l border-border shadow-xl">
              <CommunicationDraftPanel drafts={activeDrafts} onSend={(tab, subj, body) => handleSendDraft(tab, subj, body)} onClose={() => setShowDraftPanel(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Escalation Modal */}
      <AnimatePresence>
        {showEscalationModal && (
          <EscalationModal
            shipmentId={scenario.shipment.id}
            aiReasoning={buildAiReasoning()}
            onClose={() => setShowEscalationModal(false)}
            onApprove={handleApproveEscalation}
          />
        )}
      </AnimatePresence>

      {/* Compliance Override Modal */}
      <AnimatePresence>
        {showComplianceModal && complianceOverride && (
          <>
            <motion.div key="compliance-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowComplianceModal(false)} />
            <motion.div key="compliance-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-purple-50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-semibold text-foreground">Compliance Override Review</h3>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowComplianceModal(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4">
                    <p className="text-xs font-medium text-purple-600 mb-1">Exception</p>
                    <p className="text-sm font-medium text-foreground">{complianceOverride.documentName}</p>
                    <p className="text-xs text-muted-foreground mt-1">AI cannot auto-resolve this exception. Manual review by the compliance team is required to validate and approve the override.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Approval Steps</p>
                    {[
                      { label: 'Submit to Compliance Queue', done: complianceStatus !== 'pending' },
                      { label: 'Trade Compliance Analyst Review', done: complianceStatus === 'approved' },
                      { label: 'Override Approved & Applied', done: complianceStatus === 'approved' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5">
                        <div className={cn('h-5 w-5 rounded-full flex items-center justify-center', step.done ? 'bg-green-100' : 'bg-muted')}>
                          {step.done ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                        </div>
                        <span className={cn('text-sm', step.done ? 'text-green-700 font-medium' : 'text-muted-foreground')}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                  {complianceStatus === 'pending' && (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
                      const override = complianceOverride;
                      setComplianceStatus('reviewing');
                      setTimeout(() => {
                        setComplianceStatus('approved');
                        toast.success('Override approved by Trade Compliance. Exception updated.');
                        // Confirm the override action
                        if (pendingOverrideActionRef.current) {
                          const aid = pendingOverrideActionRef.current;
                          pendingOverrideActionRef.current = null;
                          setRepliedActionIds((prev) => new Set([...prev, aid]));
                        }
                        setTimeout(() => {
                          setShowComplianceModal(false);
                          if (override) { setResolvedExceptions((prev) => new Set([...prev, override.exceptionId])); setSelectedExceptionId(null); }
                        }, 1200);
                      }, 1500);
                    }}>Submit for Compliance Review</Button>
                  )}
                  {complianceStatus === 'reviewing' && (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-purple-600">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                      Compliance team reviewing...
                    </div>
                  )}
                  {complianceStatus === 'approved' && (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> Override approved and applied
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Final Doc Pack Modal */}
      <AnimatePresence>
        {showDocPack && (
          <>
            <motion.div key="docpack-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowDocPack(false)} />
            <motion.div key="docpack-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-green-50">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-foreground">Final Document Pack</h3>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowDocPack(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-lg border border-green-100 bg-green-50/50 p-4">
                    <p className="text-xs font-medium text-green-700 mb-1">{scenario.shipment.id} — {scenario.shipment.carrier} / {scenario.shipment.vessel}</p>
                    <p className="text-xs text-muted-foreground">All documents validated. Assembling handoff package for destination region.</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Included Documents</p>
                    {enhancedDocuments.map((doc) => {
                      const isValid = doc.status === 'validated';
                      return (
                        <div key={doc.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                          <FileCheck2 className={cn('h-4 w-4 shrink-0', isValid ? 'text-green-500' : 'text-amber-500')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            {doc.fileName && <p className="text-[10px] text-muted-foreground">{doc.fileName}</p>}
                          </div>
                          <Badge variant={isValid ? 'resolved' : 'warning'}>{isValid ? 'Validated' : 'Resolved'}</Badge>
                        </div>
                      );
                    })}
                  </div>
                  {scenario.hazmat && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-start gap-2">
                      <Flame className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-orange-700">DG Compliance Verified</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{scenario.hazmat.dgClass} — MSDS + DG Declaration included. Trade compliance sign-off recorded.</p>
                      </div>
                    </div>
                  )}
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={() => { setShowDocPack(false); toast.success(`OTM Milestone Updated: "Document Handoff Complete" — ${scenario.shipment.id}`); }}>
                    <Package className="h-4 w-4" />
                    Complete Handoff to Destination
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scenario Upload Modal */}
      <AnimatePresence>
        {showScenarioUpload && (
          <ScenarioUploadModal onClose={() => setShowScenarioUpload(false)} onImport={handleImportScenario} />
        )}
      </AnimatePresence>

      {/* Happy Path — Document Ready Animation */}
      <AnimatePresence>
        {showReadyAnim && (
          <ReadyAnimation
            shipmentId={scenario.shipment.id}
            totalDocs={enhancedDocuments.length}
            onDismiss={handleHandoffComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
