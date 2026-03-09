import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Flame,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Package,
  X,
  ArrowRight,
  Mail,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { scenarios as builtInScenarios } from './data/scenarios';
import type { ExceptionStatus, Scenario, DocumentException, ResolutionAction } from './data/types';
import { useToast } from './components/ui/Toast';
import { formatCountdown, getCutoffColor } from './lib/utils';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

import { ShipmentHeader } from './components/shipment/ShipmentHeader';
import { CutoffTimer } from './components/shipment/CutoffTimer';
import { ReadinessScore } from './components/shipment/ReadinessScore';
import { GateCheck } from './components/shipment/GateCheck';
import { RequiredDocsChecklist } from './components/shipment/RequiredDocsChecklist';
import { MatchingSummaryCard } from './components/shipment/MatchingSummaryCard';

import { ExceptionTable } from './components/exceptions/ExceptionTable';
import { ExceptionDetailPanel, actionConfig } from './components/exceptions/ExceptionDetailPanel';

import { CommunicationDraftPanel } from './components/communications/CommunicationDraftPanel';
import { EmailPreview } from './components/communications/EmailPreview';

import { ResolutionTimeline } from './components/timeline/ResolutionTimeline';

import { RiskBanner } from './components/alerts/RiskBanner';
import { EscalationModal } from './components/alerts/EscalationModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { AnalyticsView } from './components/analytics/AnalyticsView';

import { AiChatPanel } from './components/ai/AiChatPanel';
import { ScenarioUploadModal } from './components/ui/ScenarioUploadModal';
import { DocumentUploadZone } from './components/ui/DocumentUploadZone';

type ViewId = 'dashboard' | 'analytics' | 'overview' | 'exceptions' | 'documents' | 'communications' | 'timeline';

const viewTitles: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  overview: 'Shipment Overview',
  exceptions: 'Exception Workbench',
  documents: 'Document Status',
  communications: 'Communications',
  timeline: 'Resolution Timeline',
};

export default function App() {
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [activeScenarioId, setActiveScenarioId] = useState(builtInScenarios[0].id);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [activeDrafts, setActiveDrafts] = useState<typeof builtInScenarios[0]['exceptions'][0]['emailDrafts']>([]);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [resolvedExceptions, setResolvedExceptions] = useState<Set<string>>(new Set());
  const [escalationActions, setEscalationActions] = useState<
    { target: string; description: string; status: 'pending' | 'sent' | 'confirmed' }[]
  >([]);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceOverride, setComplianceOverride] = useState<{ exceptionId: string; documentName: string } | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<'pending' | 'reviewing' | 'approved'>('pending');
  const [showDocPack, setShowDocPack] = useState(false);
  const [tradeSignOff, setTradeSignOff] = useState(false);

  // AI Panel
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Scenario Upload
  const [showScenarioUpload, setShowScenarioUpload] = useState(false);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);

  const allScenarios = useMemo(
    () => [...builtInScenarios, ...customScenarios],
    [customScenarios]
  );

  const scenarioOptions = useMemo(
    () => allScenarios.map((s) => ({ id: s.id, name: s.name })),
    [allScenarios]
  );

  const scenario = useMemo(
    () => allScenarios.find((s) => s.id === activeScenarioId) ?? builtInScenarios[0],
    [activeScenarioId, allScenarios]
  );

  const exceptions = useMemo(
    () =>
      scenario.exceptions.map((exc) => ({
        ...exc,
        status: resolvedExceptions.has(exc.id)
          ? ('resolved' as ExceptionStatus)
          : exc.status,
      })),
    [scenario.exceptions, resolvedExceptions]
  );

  const selectedExc = useMemo(
    () => exceptions.find((e) => e.id === selectedExceptionId) ?? null,
    [exceptions, selectedExceptionId]
  );

  const openBlockingCount = useMemo(
    () => exceptions.filter((e) => e.blocking && e.status !== 'resolved').length,
    [exceptions]
  );

  const adjustedReadiness = useMemo(() => {
    const totalBlocking = scenario.exceptions.filter((e) => e.blocking).length;
    const resolvedBlocking = scenario.exceptions.filter(
      (e) => e.blocking && resolvedExceptions.has(e.id)
    ).length;
    if (totalBlocking === 0) return scenario.shipment.readinessScore;
    const boost = (resolvedBlocking / totalBlocking) * (100 - scenario.shipment.readinessScore);
    return Math.round(scenario.shipment.readinessScore + boost);
  }, [scenario, resolvedExceptions]);

  const gates = useMemo(() => {
    const allReceived = scenario.documents.every((d) => d.status !== 'missing' && d.status !== 'pending');
    const noBlockers = openBlockingCount === 0;
    const allValid = allReceived && noBlockers;
    return [
      { name: 'Docs Received', status: allReceived ? 'passed' as const : 'active' as const },
      { name: 'Validated', status: allValid ? 'passed' as const : allReceived ? 'blocked' as const : 'locked' as const },
      { name: 'Compliance', status: allValid ? (adjustedReadiness >= 100 ? 'passed' as const : 'active' as const) : 'locked' as const },
      { name: 'Handoff Ready', status: adjustedReadiness >= 100 ? 'passed' as const : 'locked' as const },
    ];
  }, [scenario.documents, openBlockingCount, adjustedReadiness]);

  // Quick Actions: aggregate resolution actions from all unresolved exceptions
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
  }, []);

  const handleActionForException = useCallback(
    (exc: DocumentException, actionId: string) => {
      const action = exc.resolutionActions.find((a) => a.id === actionId);
      if (!action) return;

      if (action.type === 'email' || action.type === 'internal') {
        setActiveDrafts(exc.emailDrafts);
        setShowDraftPanel(true);
      } else if (action.type === 'escalation') {
        setEscalationActions([
          { target: 'Export Coordinator', description: 'Direct notification with full context', status: 'pending' },
          { target: 'Customs Broker', description: 'Urgent escalation-level communication', status: 'pending' },
          { target: 'Trade Compliance', description: 'Compliance team review and approval', status: 'pending' },
          { target: 'Destination Region', description: 'Handoff delay risk warning', status: 'pending' },
        ]);
        setShowEscalationModal(true);
      } else if (action.type === 'override') {
        setComplianceOverride({ exceptionId: exc.id, documentName: exc.documentName });
        setComplianceStatus('pending');
        setShowComplianceModal(true);
      }
    },
    []
  );

  const handleAction = useCallback(
    (actionId: string) => {
      if (!selectedExc) return;
      handleActionForException(selectedExc, actionId);
    },
    [selectedExc, handleActionForException]
  );

  const handleResolve = useCallback(() => {
    if (!selectedExceptionId) return;
    setResolvedExceptions((prev) => new Set([...prev, selectedExceptionId]));
    setSelectedExceptionId(null);
    showToast('Exception marked as resolved. Readiness score updated.', 'success');
  }, [selectedExceptionId, showToast]);

  const handleSendDraft = useCallback(
    (tab: string) => {
      setShowDraftPanel(false);
      showToast(`Communication sent: ${tab}`, 'success');
    },
    [showToast]
  );

  const handleEscalate = useCallback(() => {
    setEscalationActions((prev) => prev.map((a) => ({ ...a, status: 'sent' as const })));
    setTimeout(() => {
      setEscalationActions((prev) => prev.map((a) => ({ ...a, status: 'confirmed' as const })));
      showToast('All escalation notifications sent successfully.', 'success');
      setTimeout(() => setShowEscalationModal(false), 1200);
    }, 1500);
  }, [showToast]);

  const handleRiskEscalate = useCallback(() => {
    setEscalationActions([
      { target: 'Export Coordinator', description: 'Direct notification with full shipment context', status: 'pending' },
      { target: 'Customs Broker', description: 'Urgent: immediate response required', status: 'pending' },
      { target: 'Trade Compliance', description: 'Manual sign-off authorization may be required', status: 'pending' },
      { target: 'Destination Region', description: 'Handoff delay risk — early warning', status: 'pending' },
      { target: 'VP Operations', description: 'Executive escalation — revenue impact notification', status: 'pending' },
    ]);
    setShowEscalationModal(true);
  }, []);

  const handleImportScenario = useCallback((sc: Scenario) => {
    setCustomScenarios((prev) => [...prev, sc]);
    setActiveScenarioId(sc.id);
    setSelectedExceptionId(null);
    setResolvedExceptions(new Set());
    setActiveView('overview');
    showToast(`Scenario "${sc.name}" imported successfully.`, 'success');
  }, [showToast]);

  const handleOpenDraft = useCallback(() => {
    const firstUnresolved = exceptions.find((e) => e.status !== 'resolved' && e.emailDrafts.length > 0);
    if (firstUnresolved) {
      setActiveDrafts(firstUnresolved.emailDrafts);
      setShowDraftPanel(true);
    }
  }, [exceptions]);

  const isWarRoom = scenario.warRoom;
  const receivedCount = scenario.documents.filter(
    (d) => d.status !== 'missing' && d.status !== 'pending'
  ).length;

  return (
    <div className={`flex h-screen overflow-hidden ${isWarRoom ? 'war-room' : ''}`}>
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        exceptionCount={exceptions.filter((e) => e.status !== 'resolved').length}
        shipmentId={scenario.shipment.id}
        shipmentStatus={isWarRoom ? 'blocked' : scenario.shipment.status}
        cutoffHours={scenario.shipment.cutoffHours}
        readinessPercent={adjustedReadiness}
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
        />

        {isWarRoom && activeView !== 'dashboard' && activeView !== 'analytics' && (
          <RiskBanner
            shipmentId={scenario.shipment.id}
            blockerCount={openBlockingCount}
            hoursRemaining={scenario.shipment.cutoffHours}
            issues={exceptions
              .filter((e) => e.blocking && e.status !== 'resolved')
              .map((e) => e.summary.split('.')[0])}
            onEscalate={handleRiskEscalate}
          />
        )}

        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6">
          {/* DASHBOARD */}
          {activeView === 'dashboard' && (
            <DashboardView />
          )}

          {/* ANALYTICS */}
          {activeView === 'analytics' && (
            <AnalyticsView />
          )}

          {/* OVERVIEW — Command Center */}
          {activeView === 'overview' && (
            <div className="space-y-4">
              {/* Hazmat Classification Banner */}
              {scenario.hazmat && (
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-5 py-3 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 ring-1 ring-orange-500/30">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-orange-400">
                        Dangerous Goods Shipment
                      </span>
                      <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-300 ring-1 ring-orange-500/30">
                        {scenario.hazmat.dgClass}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-300">
                      UN {scenario.hazmat.unNumber} &mdash; {scenario.hazmat.properShippingName}
                    </p>
                    <p className="mt-0.5 text-[10px] text-neutral-500">
                      Requires MSDS + DG Declaration + Trade Compliance sign-off before handoff
                    </p>
                  </div>
                </div>
              )}

              {/* Row 1: Compact Command Header */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-5 py-4">
                <div className="flex items-center gap-4">
                  {/* Shipment ID + Status */}
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-bold font-mono text-white">{scenario.shipment.id}</code>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${
                        scenario.shipment.status === 'on-track'
                          ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                          : scenario.shipment.status === 'at-risk'
                          ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                          : 'bg-red-500/10 text-red-400 ring-red-500/20'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          scenario.shipment.status === 'on-track'
                            ? 'bg-emerald-500'
                            : scenario.shipment.status === 'at-risk'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      {scenario.shipment.status === 'on-track'
                        ? 'On Track'
                        : scenario.shipment.status === 'at-risk'
                        ? 'At Risk'
                        : 'Blocked'}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-neutral-800" />

                  {/* Route */}
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="font-medium text-white">{scenario.shipment.origin.port}</span>
                    <ArrowRight className="h-3 w-3 text-neutral-600" />
                    <span className="font-medium text-white">{scenario.shipment.destination.port}</span>
                    <span className="text-neutral-600">|</span>
                    <span>{scenario.shipment.carrier} / {scenario.shipment.vessel} / {scenario.shipment.voyage}</span>
                  </div>

                  <div className="ml-auto flex items-center gap-6">
                    {/* Cutoff */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold tabular-nums ${
                        scenario.shipment.cutoffHours < 8 ? 'text-red-400' : scenario.shipment.cutoffHours < 24 ? 'text-amber-400' : 'text-white'
                      }`}>
                        {formatCountdown(scenario.shipment.cutoffHours)}
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase">to cutoff</span>
                    </div>

                    <div className="h-6 w-px bg-neutral-800" />

                    {/* Readiness */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold tabular-nums ${
                        adjustedReadiness >= 90 ? 'text-emerald-400' : adjustedReadiness >= 70 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {adjustedReadiness}%
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase">ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Document Readiness + Matching */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 space-y-4">
                  <RequiredDocsChecklist documents={scenario.documents} laneRequirements={scenario.laneRequirements} />
                  <DocumentUploadZone compact onUploadComplete={() => showToast('Document processed. Matching updated.', 'success')} />
                </div>
                <div className="col-span-4 space-y-4">
                  <MatchingSummaryCard summary={scenario.matchingSummary} />
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Gate Check</p>
                    <GateCheck gates={gates} />
                  </div>
                </div>
              </div>

              {/* Row 3: Exceptions + Quick Actions + Mini Timeline */}
              <div className="grid grid-cols-12 gap-4">
                {/* Active Exceptions */}
                <div className="col-span-5">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                      Active Exceptions
                    </p>
                    <div className="space-y-2">
                      {exceptions.filter((e) => e.status !== 'resolved').length === 0 ? (
                        <div className="text-center py-6">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          </div>
                          <p className="text-sm font-medium text-emerald-400">All exceptions resolved</p>
                          <p className="text-xs text-neutral-500 mt-1">Document handoff pack is ready</p>
                          {scenario.hazmat && !tradeSignOff ? (
                            <button
                              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-purple-500 hover:bg-purple-600 transition-colors inline-flex items-center gap-1.5"
                              onClick={() => setTradeSignOff(true)}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Trade Compliance Sign-Off
                            </button>
                          ) : (
                            <button
                              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors inline-flex items-center gap-1.5"
                              onClick={() => setShowDocPack(true)}
                            >
                              <Package className="w-3.5 h-3.5" />
                              Assemble Final Doc Pack
                            </button>
                          )}
                          {tradeSignOff && scenario.hazmat && (
                            <div className="mt-2 rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-left">
                              <div className="flex items-center gap-1.5 mb-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                <span className="text-[11px] font-semibold uppercase text-purple-400">Trade Compliance Confirmed</span>
                              </div>
                              <p className="text-[11px] text-neutral-400">DG Class 3 documentation reviewed and approved. MSDS, DG Declaration, and IMDG compliance verified.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        exceptions
                          .filter((e) => e.status !== 'resolved')
                          .slice(0, 4)
                          .map((exc) => (
                            <button
                              key={exc.id}
                              className="w-full text-left p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-all"
                              onClick={() => {
                                setActiveView('exceptions');
                                setSelectedExceptionId(exc.id);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-white">{exc.documentName}</span>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md ring-1 ${
                                    exc.severity === 'critical'
                                      ? 'bg-red-500/10 text-red-400 ring-red-500/20'
                                      : exc.severity === 'high'
                                      ? 'bg-orange-500/10 text-orange-400 ring-orange-500/20'
                                      : exc.severity === 'medium'
                                      ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                                      : 'bg-neutral-500/10 text-neutral-400 ring-neutral-500/20'
                                  }`}
                                >
                                  {exc.severity}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">{exc.summary}</p>
                            </button>
                          ))
                      )}
                    </div>
                    {exceptions.filter((e) => e.status !== 'resolved').length > 0 && (
                      <button
                        className="mt-3 w-full text-center text-xs font-medium py-2 rounded-lg border border-neutral-700 text-blue-400 hover:bg-neutral-800 transition-colors"
                        onClick={() => setActiveView('exceptions')}
                      >
                        View All Exceptions
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="col-span-4">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                      Quick Actions
                    </p>
                    {quickActions.length === 0 ? (
                      <p className="text-xs text-neutral-600 text-center py-6">No pending actions</p>
                    ) : (
                      <div className="space-y-2">
                        {quickActions.map(({ exception: exc, action }) => {
                          const cfg = actionConfig[action.type];
                          const Icon = cfg.icon;
                          return (
                            <div
                              key={`${exc.id}-${action.id}`}
                              className="rounded-lg border border-neutral-800 bg-neutral-800/30 p-3"
                            >
                              <div className="flex items-start gap-2">
                                <Icon className="h-4 w-4 mt-0.5 shrink-0 text-blue-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-white truncate">{action.label}</p>
                                  <p className="text-[10px] text-neutral-500 mt-0.5">{exc.documentName} → {action.target}</p>
                                </div>
                                <button
                                  onClick={() => handleActionForException(exc, action.id)}
                                  className="shrink-0 rounded-md px-2.5 py-1 text-[10px] font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                >
                                  Execute
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini Timeline */}
                <div className="col-span-3">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4" style={{ maxHeight: 300 }}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                      Recent Events
                    </p>
                    {scenario.globalTimeline.length === 0 ? (
                      <p className="text-xs text-neutral-600 text-center py-6">No events yet</p>
                    ) : (
                      <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
                        <ResolutionTimeline events={scenario.globalTimeline.slice(-6)} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EXCEPTIONS */}
          {activeView === 'exceptions' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
                  <h3 className="text-sm font-semibold text-white">Exception Workbench</h3>
                  <div className="flex items-center gap-5">
                    <div className="text-xs">
                      <span className="text-neutral-500">Total:</span>{' '}
                      <span className="font-semibold text-white">{exceptions.length}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-neutral-500">Critical:</span>{' '}
                      <span className="font-semibold text-red-400">
                        {exceptions.filter((e) => e.severity === 'critical' && e.status !== 'resolved').length}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-neutral-500">High:</span>{' '}
                      <span className="font-semibold text-orange-400">
                        {exceptions.filter((e) => e.severity === 'high' && e.status !== 'resolved').length}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-neutral-500">Blocking:</span>{' '}
                      <span className="font-semibold text-red-400">{openBlockingCount}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-neutral-500">Resolved:</span>{' '}
                      <span className="font-semibold text-emerald-400">
                        {exceptions.filter((e) => e.status === 'resolved').length}
                      </span>
                    </div>
                  </div>
                </div>
                <ExceptionTable
                  exceptions={exceptions}
                  selectedId={selectedExceptionId}
                  onSelect={(id) => setSelectedExceptionId(id)}
                />
              </div>

              {scenario.globalTimeline.length > 0 && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                  <div className="border-b border-neutral-800 px-5 py-3">
                    <h3 className="text-sm font-semibold text-white">Resolution History</h3>
                  </div>
                  <div className="p-4">
                    <ResolutionTimeline events={scenario.globalTimeline} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeView === 'documents' && (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <RequiredDocsChecklist documents={scenario.documents} laneRequirements={scenario.laneRequirements} />
                </div>
                <div className="col-span-4 space-y-4">
                  <MatchingSummaryCard summary={scenario.matchingSummary} />
                  <div className="flex justify-center">
                    <ReadinessScore
                      score={adjustedReadiness}
                      label={`${receivedCount} of ${scenario.documents.length} documents`}
                    />
                  </div>
                </div>
              </div>
              <DocumentUploadZone onUploadComplete={() => showToast('Document processed. Matching updated.', 'success')} />
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Gate Check</p>
                <GateCheck gates={gates} />
              </div>
            </div>
          )}

          {/* COMMUNICATIONS */}
          {activeView === 'communications' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">
                AI-generated communications for active exceptions. Review before sending.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {exceptions
                  .filter((e) => e.status !== 'resolved')
                  .flatMap((exc) =>
                    exc.emailDrafts.map((draft, i) => (
                      <div key={`${exc.id}-${i}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-md ring-1 ${
                              exc.severity === 'critical'
                                ? 'bg-red-500/10 text-red-400 ring-red-500/20'
                                : exc.severity === 'high'
                                ? 'bg-orange-500/10 text-orange-400 ring-orange-500/20'
                                : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                            }`}
                          >
                            {exc.severity}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {exc.id} — {exc.documentName}
                          </span>
                        </div>
                        <EmailPreview draft={draft} />
                      </div>
                    ))
                  )}
              </div>
              {exceptions.filter((e) => e.status !== 'resolved').length === 0 && (
                <div className="text-center py-16 text-neutral-500">
                  <p className="text-sm">No active exceptions. All communications resolved.</p>
                </div>
              )}
            </div>
          )}

          {/* TIMELINE */}
          {activeView === 'timeline' && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
                <h3 className="text-sm font-semibold text-white">Resolution Timeline</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-neutral-500">
                    <span className="font-semibold text-white">{scenario.globalTimeline.length}</span> events
                  </span>
                  {scenario.globalTimeline.filter((e) => e.type === 'critical').length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="font-medium text-red-400">
                        {scenario.globalTimeline.filter((e) => e.type === 'critical').length} critical
                      </span>
                    </span>
                  )}
                  {scenario.globalTimeline.filter((e) => e.type === 'warning').length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-medium text-amber-400">
                        {scenario.globalTimeline.filter((e) => e.type === 'warning').length} warnings
                      </span>
                    </span>
                  )}
                  {scenario.globalTimeline.filter((e) => e.type === 'positive').length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-emerald-400">
                        {scenario.globalTimeline.filter((e) => e.type === 'positive').length} resolved
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <ResolutionTimeline events={scenario.globalTimeline} />
              </div>
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

      <AnimatePresence>
        {showDraftPanel && activeDrafts.length > 0 && (
          <>
            <motion.div
              key="draft-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setShowDraftPanel(false)}
            />
            <motion.div
              key="draft-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[480px] border-l border-slate-200 shadow-xl"
            >
              <CommunicationDraftPanel
                drafts={activeDrafts}
                onSend={handleSendDraft}
                onClose={() => setShowDraftPanel(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEscalationModal && (
          <EscalationModal
            shipmentId={scenario.shipment.id}
            actions={escalationActions}
            onClose={() => setShowEscalationModal(false)}
            onExecute={handleEscalate}
          />
        )}
      </AnimatePresence>

      {/* Compliance Override Approval Modal */}
      <AnimatePresence>
        {showComplianceModal && complianceOverride && (
          <>
            <motion.div
              key="compliance-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30"
              onClick={() => setShowComplianceModal(false)}
            />
            <motion.div
              key="compliance-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-purple-50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Compliance Override Review</h3>
                  </div>
                  <button onClick={() => setShowComplianceModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4">
                    <p className="text-xs font-medium text-purple-600 mb-1">Exception</p>
                    <p className="text-sm font-medium text-slate-800">{complianceOverride.documentName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      AI cannot auto-resolve this exception. Manual review by the compliance team is required to validate and approve the override.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approval Steps</p>
                    {[
                      { label: 'Submit to Compliance Queue', done: complianceStatus !== 'pending' },
                      { label: 'Trade Compliance Analyst Review', done: complianceStatus === 'approved' },
                      { label: 'Override Approved & Applied', done: complianceStatus === 'approved' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          step.done ? 'bg-green-100' : 'bg-slate-100'
                        }`}>
                          {step.done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                          )}
                        </div>
                        <span className={`text-sm ${step.done ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {complianceStatus === 'pending' && (
                    <button
                      className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                      onClick={() => {
                        const override = complianceOverride;
                        setComplianceStatus('reviewing');
                        setTimeout(() => {
                          setComplianceStatus('approved');
                          showToast('Override approved by Trade Compliance. Exception updated.', 'success');
                          setTimeout(() => {
                            setShowComplianceModal(false);
                            if (override) {
                              setResolvedExceptions((prev) => new Set([...prev, override.exceptionId]));
                              setSelectedExceptionId(null);
                            }
                          }, 1200);
                        }, 1500);
                      }}
                    >
                      Submit for Compliance Review
                    </button>
                  )}
                  {complianceStatus === 'reviewing' && (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-purple-600">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                      Compliance team reviewing...
                    </div>
                  )}
                  {complianceStatus === 'approved' && (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Override approved and applied
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Final Doc Pack Assembly Modal */}
      <AnimatePresence>
        {showDocPack && (
          <>
            <motion.div
              key="docpack-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30"
              onClick={() => setShowDocPack(false)}
            />
            <motion.div
              key="docpack-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-green-50">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Final Document Pack</h3>
                  </div>
                  <button onClick={() => setShowDocPack(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-lg border border-green-100 bg-green-50/50 p-4">
                    <p className="text-xs font-medium text-green-700 mb-1">
                      {scenario.shipment.id} &mdash; {scenario.shipment.carrier} / {scenario.shipment.vessel}
                    </p>
                    <p className="text-xs text-slate-600">
                      All documents validated. Assembling handoff package for destination region.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Included Documents</p>
                    {scenario.documents.map((doc) => {
                      const isValid = doc.status === 'validated';
                      return (
                        <div key={doc.id} className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2">
                          <FileCheck2 className={`h-4 w-4 shrink-0 ${isValid ? 'text-green-500' : 'text-amber-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                            {doc.fileName && (
                              <p className="text-[10px] text-slate-400">{doc.fileName}</p>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isValid ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                            {isValid ? 'Validated' : 'Resolved'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {scenario.hazmat && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-start gap-2">
                      <Flame className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-orange-700">DG Compliance Verified</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {scenario.hazmat.dgClass} &mdash; MSDS + DG Declaration included. Trade compliance sign-off recorded.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
                    onClick={() => {
                      setShowDocPack(false);
                      showToast('Final doc pack assembled and handoff milestone marked complete in OTM.', 'success');
                    }}
                  >
                    <Package className="h-4 w-4" />
                    Complete Handoff to Destination
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scenario Upload Modal */}
      <AnimatePresence>
        {showScenarioUpload && (
          <ScenarioUploadModal
            onClose={() => setShowScenarioUpload(false)}
            onImport={handleImportScenario}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
