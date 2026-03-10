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
} from 'lucide-react';
import { scenarios as builtInScenarios } from '@/data/scenarios';
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

import { ExceptionTable } from '@/components/exceptions/ExceptionTable';
import { ExceptionDetailPanel, actionConfig } from '@/components/exceptions/ExceptionDetailPanel';

import { CommunicationDraftPanel } from '@/components/communications/CommunicationDraftPanel';
import { EmailPreview } from '@/components/communications/EmailPreview';

import { ResolutionTimeline } from '@/components/timeline/ResolutionTimeline';

import { RiskBanner } from '@/components/alerts/RiskBanner';
import { EscalationModal } from '@/components/alerts/EscalationModal';
import type { AiReasoning } from '@/components/alerts/EscalationModal';

import { EmailView } from '@/components/email/EmailView';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';

import { AiChatPanel } from '@/components/ai/AiChatPanel';
import { ScenarioUploadModal } from '@/components/ui/ScenarioUploadModal';
import { DocumentUploadZone } from '@/components/ui/DocumentUploadZone';
import { ReadyAnimation } from '@/components/ui/ReadyAnimation';

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

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [activeScenarioId, setActiveScenarioId] = useState(builtInScenarios[0].id);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [activeDrafts, setActiveDrafts] = useState<typeof builtInScenarios[0]['exceptions'][0]['emailDrafts']>([]);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [resolvedExceptions, setResolvedExceptions] = useState<Set<string>>(new Set());
  const [escalationActions, setEscalationActions] = useState<
    {
      target: string;
      description: string;
      status: 'pending' | 'sent' | 'confirmed';
      contact?: {
        name: string;
        role: string;
        phone: string;
        altPhone?: string;
        email: string;
      };
    }[]
  >([]);
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
  const [inboxHasNewReply, setInboxHasNewReply] = useState(false);
  const [emailSubView, setEmailSubView] = useState<'inbox' | 'sent'>('inbox');
  const [resolvedDocTypes, setResolvedDocTypes] = useState<Set<ResolveDocType>>(new Set());
  const [liveCountdownSecs, setLiveCountdownSecs] = useState<number | null>(null);
  const [showReadyAnim, setShowReadyAnim] = useState(false);
  const readyAnimShownRef = useRef(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allScenarios = useMemo(() => [...builtInScenarios, ...customScenarios], [customScenarios]);
  const scenarioOptions = useMemo(() => allScenarios.map((s) => ({ id: s.id, name: s.name })), [allScenarios]);
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

  const handleViewChange = useCallback((view: ViewId) => {
    setActiveView(view);
    // Only the Shipment Overview shows the list page; sub-tabs and other views go direct
    if (view === 'overview') {
      setShowShipmentList(true);
    }
  }, []);

  const handleSelectShipment = useCallback((id: string) => {
    setActiveScenarioId(id);
    setSelectedExceptionId(null);
    setResolvedExceptions(new Set());
    setShowShipmentList(false);
  }, []);

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
    setInboxHasNewReply(false);
    setEmailSubView('inbox');
    setResolvedDocTypes(new Set());
    setShowReadyAnim(false);
    readyAnimShownRef.current = false;
  }, []);

  const handleActionForException = useCallback((exc: DocumentException, actionId: string) => {
    const action = exc.resolutionActions.find((a) => a.id === actionId);
    if (!action) return;
    if (action.type === 'email' || action.type === 'internal') {
      setActiveDrafts(exc.emailDrafts);
      setShowDraftPanel(true);
    } else if (action.type === 'escalation') {
      setEscalationActions([
        {
          target: 'Export Coordinator',
          description: 'Direct notification with full shipment context and exception log',
          status: 'pending',
          contact: {
            name: 'Jennifer Walsh',
            role: 'Senior Export Coordinator, Shanghai Hub',
            phone: '+1 (213) 555-0192',
            altPhone: '+1 (213) 555-0193',
            email: 'j.walsh@globalforwarding.com',
          },
        },
        {
          target: 'Customs Broker',
          description: 'Urgent ISF filing escalation — carrier deadline at risk',
          status: 'pending',
          contact: {
            name: 'Marcus Chen',
            role: 'Licensed Customs Broker, LA Gateway',
            phone: '+1 (310) 555-0847',
            altPhone: '+1 (310) 555-0848',
            email: 'm.chen@cbpbrokers.com',
          },
        },
        {
          target: 'Trade Compliance',
          description: 'Compliance team review and manual authorization required',
          status: 'pending',
          contact: {
            name: 'Priya Nair',
            role: 'Trade Compliance Manager',
            phone: '+1 (415) 555-0321',
            email: 'p.nair@tradecompliance.io',
          },
        },
        {
          target: 'Destination Region',
          description: 'Handoff delay risk — early warning to destination ops',
          status: 'pending',
          contact: {
            name: 'David Ortega',
            role: 'Destination Ops Lead, Los Angeles',
            phone: '+1 (323) 555-0674',
            email: 'd.ortega@destops-lax.com',
          },
        },
      ]);
      setShowEscalationModal(true);
    } else if (action.type === 'override') {
      setComplianceOverride({ exceptionId: exc.id, documentName: exc.documentName });
      setComplianceStatus('pending');
      setShowComplianceModal(true);
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

  const handleSendDraft = useCallback((tab: string, editedSubject?: string, editedBody?: string) => {
    const draft = activeDrafts.find((d) => d.tab === tab);
    if (draft) {
      const finalDraft = {
        ...draft,
        subject: editedSubject ?? draft.subject,
        body: editedBody ?? draft.body,
      };
      const sentId = `sent-${Date.now()}`;
      setSentEmails((prev) => [
        ...prev,
        { id: sentId, timestamp: new Date().toISOString(), draft: finalDraft },
      ]);
      // Simulate reply after 2 seconds
      setTimeout(() => {
        const reply = generateReply(finalDraft);
        setInboxEmails((prev) => [reply, ...prev]);
        setInboxHasNewReply(true);
        // Mark document type as resolved
        if (reply.resolveDocType) {
          const docType = reply.resolveDocType;
          setResolvedDocTypes((prev) => new Set([...prev, docType]));
          // Also auto-resolve the associated exceptions so gate check progresses
          setResolvedExceptions((prev) => {
            const newSet = new Set(prev);
            scenario.exceptions.forEach((exc) => {
              const name = exc.documentName.toLowerCase();
              if (
                (docType === 'isf' && (name.includes('isf') || name.includes('importer security'))) ||
                (docType === 'invoice' && (name.includes('invoice') || name.includes('commercial') || name.includes('packing list'))) ||
                (docType === 'msds' && (name.includes('msds') || name.includes('material safety') || name.includes('dangerous goods') || name.includes('dg '))) ||
                (docType === 'general' && exc.blocking)
              ) {
                newSet.add(exc.id);
              }
            });
            return newSet;
          });
        }
      }, 2000);
    }
    setShowDraftPanel(false);
    toast.success(`Email sent to ${tab}`);
  }, [activeDrafts, scenario]);

  const handleEscalate = useCallback(() => {
    setEscalationActions((prev) => prev.map((a) => ({ ...a, status: 'sent' as const })));
    setTimeout(() => {
      setEscalationActions((prev) => prev.map((a) => ({ ...a, status: 'confirmed' as const })));
      toast.success('All escalation notifications sent successfully.');
      setTimeout(() => setShowEscalationModal(false), 1200);
    }, 1500);
  }, []);

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
    setEscalationActions([
      {
        target: 'Export Coordinator',
        description: 'Direct notification with full shipment context and exception log',
        status: 'pending',
        contact: {
          name: 'Jennifer Walsh',
          role: 'Senior Export Coordinator, Shanghai Hub',
          phone: '+1 (213) 555-0192',
          altPhone: '+1 (213) 555-0193',
          email: 'j.walsh@globalforwarding.com',
        },
      },
      {
        target: 'Customs Broker',
        description: 'Urgent ISF filing escalation — vessel departure in 4 hours',
        status: 'pending',
        contact: {
          name: 'Marcus Chen',
          role: 'Licensed Customs Broker, LA Gateway',
          phone: '+1 (310) 555-0847',
          altPhone: '+1 (310) 555-0848',
          email: 'm.chen@cbpbrokers.com',
        },
      },
      {
        target: 'Trade Compliance',
        description: 'Manual sign-off — CBP penalty risk, authorization required',
        status: 'pending',
        contact: {
          name: 'Priya Nair',
          role: 'Trade Compliance Manager',
          phone: '+1 (415) 555-0321',
          email: 'p.nair@tradecompliance.io',
        },
      },
      {
        target: 'Destination Region',
        description: 'Handoff delay risk — early warning to destination ops',
        status: 'pending',
        contact: {
          name: 'David Ortega',
          role: 'Destination Ops Lead, Los Angeles',
          phone: '+1 (323) 555-0674',
          email: 'd.ortega@destops-lax.com',
        },
      },
      {
        target: 'VP Operations',
        description: 'Executive escalation — revenue impact & customer SLA breach',
        status: 'pending',
        contact: {
          name: 'Sarah Kim',
          role: 'VP Operations, North America',
          phone: '+1 (646) 555-0912',
          altPhone: '+1 (646) 555-0913',
          email: 's.kim@operations.globalforwarding.com',
        },
      },
    ]);
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

  // Clear inbox notification when user navigates to email inbox
  useEffect(() => {
    if (activeView === 'email' && emailSubView === 'inbox') {
      setInboxHasNewReply(false);
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

  // Trigger happy path animation when all gates pass
  useEffect(() => {
    const allReady =
      adjustedReadiness >= 100 &&
      openBlockingCount === 0 &&
      enhancedDocuments.every((d) => d.status !== 'missing' && d.status !== 'pending');
    const inDetailView =
      !showShipmentList &&
      activeView !== 'dashboard' &&
      activeView !== 'analytics' &&
      activeView !== 'email';
    if (allReady && inDetailView && !readyAnimShownRef.current) {
      readyAnimShownRef.current = true;
      setTimeout(() => setShowReadyAnim(true), 500);
    }
  }, [adjustedReadiness, openBlockingCount, enhancedDocuments, showShipmentList, activeView]);

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

          {/* DASHBOARD */}
          {activeView === 'dashboard' && <DashboardView />}

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
              onSelect={handleSelectShipment}
            />
          )}

          {/* SHIPMENT VIEWS — Detail */}
          {activeView !== 'dashboard' && activeView !== 'analytics' && activeView !== 'email' && !showShipmentList && (
            <div className="space-y-3">
              {/* Back breadcrumb */}
              <button
                onClick={() => setShowShipmentList(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Shipments</span>
              </button>

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
                      <DocumentUploadZone compact onUploadComplete={() => toast.success('Document processed. Matching updated.')} />
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
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          {quickActions.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">No pending actions</p>
                          ) : (
                            <div className="space-y-1.5">
                              {quickActions.map(({ exception: exc, action }) => {
                                const cfg = actionConfig[action.type];
                                const Icon = cfg.icon;
                                return (
                                  <div key={`${exc.id}-${action.id}`} className={cn('rounded-md border p-2', cfg.border, cfg.bg)}>
                                    <div className="flex items-start gap-2">
                                      <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', cfg.accent)} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">{action.label}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{exc.documentName} → {action.target}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className={cn('shrink-0 h-6 px-2 text-[10px] font-medium', cfg.btnBg, cfg.btnText)}
                                        onClick={() => handleActionForException(exc, action.id)}
                                      >
                                        Execute
                                      </Button>
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
                          {scenario.globalTimeline.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">No events yet</p>
                          ) : (
                            <ResolutionTimeline events={scenario.globalTimeline.slice(-6)} />
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
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
                  {scenario.globalTimeline.length > 0 && (
                    <Card className="rounded-lg shadow-sm">
                      <div className="border-b border-border px-4 py-2.5">
                        <h3 className="text-sm font-semibold text-foreground">Resolution History</h3>
                      </div>
                      <CardContent className="pt-3">
                        <ResolutionTimeline events={scenario.globalTimeline} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* DOCUMENTS */}
              {activeView === 'documents' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-8">
                      <RequiredDocsChecklist documents={enhancedDocuments} laneRequirements={scenario.laneRequirements} />
                    </div>
                    <div className="col-span-4 space-y-3">
                      <MatchingSummaryCard summary={dynamicMatchingSummary} />
                      <div className="flex justify-center">
                        <ReadinessScore score={adjustedReadiness} label={`${receivedCount} of ${enhancedDocuments.length} documents`} />
                      </div>
                    </div>
                  </div>
                  <DocumentUploadZone onUploadComplete={() => toast.success('Document processed. Matching updated.')} />
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
                      <span className="text-muted-foreground"><span className="font-semibold text-foreground">{scenario.globalTimeline.length}</span> events</span>
                      {scenario.globalTimeline.filter((e) => e.type === 'critical').length > 0 && (
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /><span className="font-medium text-red-600">{scenario.globalTimeline.filter((e) => e.type === 'critical').length} critical</span></span>
                      )}
                      {scenario.globalTimeline.filter((e) => e.type === 'warning').length > 0 && (
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /><span className="font-medium text-amber-600">{scenario.globalTimeline.filter((e) => e.type === 'warning').length} warnings</span></span>
                      )}
                      {scenario.globalTimeline.filter((e) => e.type === 'positive').length > 0 && (
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="font-medium text-green-600">{scenario.globalTimeline.filter((e) => e.type === 'positive').length} resolved</span></span>
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-3">
                    <ResolutionTimeline events={scenario.globalTimeline} />
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
          <EscalationModal shipmentId={scenario.shipment.id} actions={escalationActions}
            onClose={() => setShowEscalationModal(false)} onExecute={handleEscalate}
            aiReasoning={buildAiReasoning()} />
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
                    onClick={() => { setShowDocPack(false); toast.success('Final doc pack assembled and handoff milestone marked complete in OTM.'); }}>
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
            onDismiss={() => setShowReadyAnim(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
