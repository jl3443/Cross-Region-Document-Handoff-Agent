import { ArrowRight, Ship, Plane, Truck, AlertTriangle, FileText, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { Scenario } from '@/data/types';
import { cn, formatCountdown, getCutoffColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ShipmentListViewProps {
  scenarios: Scenario[];
  resolvedExceptions: Set<string>;
  completedScenarios: Set<string>;
  onSelect: (id: string) => void;
}

function getStatusConfig(status: 'on-track' | 'at-risk' | 'blocked' | 'pending', warRoom?: boolean) {
  if (warRoom || status === 'blocked') {
    return {
      stripe: 'bg-red-500',
      badge: 'bg-red-100 text-red-700',
      label: warRoom ? 'War Room' : 'Blocked',
    };
  }
  if (status === 'at-risk') {
    return { stripe: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'At Risk' };
  }
  if (status === 'pending') {
    return { stripe: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700', label: 'Pending' };
  }
  return { stripe: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'On Track' };
}

function getReadinessConfig(score: number) {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-600' };
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600' };
  return { bar: 'bg-red-500', text: 'text-red-600' };
}

// ── Transport mode helper ──────────────────────────────────────────────
function getTransportModeCfg(mode?: string) {
  if (mode === 'air') return { Icon: Plane, label: 'Air Freight', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' };
  if (mode === 'road') return { Icon: Truck, label: 'Road', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' };
  return { Icon: Ship, label: 'Ocean Freight', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' };
}

// ── Decorative (non-interactive) row data ──────────────────────────────────
interface DecorativeRow {
  id: string;
  name: string;
  status: 'on-track' | 'at-risk' | 'blocked' | 'pending';
  mode?: 'ocean' | 'air' | 'road';
  origin: { city: string; port: string };
  destination: { city: string; port: string };
  carrier: string;
  vessel: string;
  voyage: string;
  cargoDescription: string;
  readiness: number;
  exceptions: number;
  criticalExceptions: number;
  totalDocs: number;
  receivedDocs: number;
  cutoffHours: number;
}

const DECORATIVE_ROWS: DecorativeRow[] = [
  {
    id: 'SHP-20488',
    name: 'Docs Awaiting Review',
    status: 'on-track',
    mode: 'ocean',
    origin: { city: 'Melbourne', port: 'AUMEL' },
    destination: { city: 'Los Angeles', port: 'USLAX' },
    carrier: 'COSCO',
    vessel: 'COSCO Galaxy',
    voyage: 'V.112W',
    cargoDescription: 'Industrial Machinery Parts',
    readiness: 100,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 8,
    receivedDocs: 8,
    cutoffHours: 28,
  },
  {
    id: 'SHP-20486',
    name: 'ISF Filing Pending',
    status: 'on-track',
    mode: 'ocean',
    origin: { city: 'Shanghai', port: 'CNSHA' },
    destination: { city: 'Seattle', port: 'USSEA' },
    carrier: 'Evergreen',
    vessel: 'Ever Ace',
    voyage: 'V.031E',
    cargoDescription: 'Consumer Electronics',
    readiness: 100,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 6,
    receivedDocs: 6,
    cutoffHours: 36,
  },
  {
    id: 'SHP-20480',
    name: 'Pending Review',
    status: 'on-track',
    mode: 'ocean',
    origin: { city: 'Singapore', port: 'SGSIN' },
    destination: { city: 'Houston', port: 'USHOU' },
    carrier: 'MSC',
    vessel: 'MSC Ambra',
    voyage: 'V.218N',
    cargoDescription: 'Pharmaceutical Ingredients',
    readiness: 100,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 7,
    receivedDocs: 7,
    cutoffHours: 42,
  },
  {
    id: 'SHP-20479',
    name: 'Docs Pending',
    status: 'on-track',
    mode: 'air',
    origin: { city: 'Shenzhen', port: 'CNSZX' },
    destination: { city: 'Long Beach', port: 'USLGB' },
    carrier: 'Yang Ming',
    vessel: 'YM Wish',
    voyage: 'V.097W',
    cargoDescription: 'Auto Parts & Accessories',
    readiness: 100,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 5,
    receivedDocs: 5,
    cutoffHours: 48,
  },
  {
    id: 'SHP-20477',
    name: 'Pending Customs Clearance',
    status: 'on-track',
    mode: 'ocean',
    origin: { city: 'Osaka', port: 'JPOSA' },
    destination: { city: 'Los Angeles', port: 'USLAX' },
    carrier: 'ONE',
    vessel: 'ONE Continuity',
    voyage: 'V.044E',
    cargoDescription: 'Precision Instruments',
    readiness: 100,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 6,
    receivedDocs: 6,
    cutoffHours: 56,
  },
  {
    id: 'SHP-20485',
    name: 'Docs Under Review',
    status: 'on-track',
    mode: 'road',
    origin: { city: 'Rotterdam', port: 'NLRTM' },
    destination: { city: 'Boston', port: 'USBOS' },
    carrier: 'Hapag-Lloyd',
    vessel: 'HL Colombo',
    voyage: 'V.019W',
    cargoDescription: 'Chemical Products (Non-DG)',
    readiness: 100,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 7,
    receivedDocs: 7,
    cutoffHours: 60,
  },
  {
    id: 'SHP-20475',
    name: 'Pending Validation',
    status: 'on-track',
    mode: 'ocean',
    origin: { city: 'Hamburg', port: 'DEHAM' },
    destination: { city: 'New York', port: 'USNYC' },
    carrier: 'Maersk',
    vessel: 'Maersk Taurus',
    voyage: 'V.116W',
    cargoDescription: 'Machinery & Equipment',
    readiness: 100,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 5,
    receivedDocs: 5,
    cutoffHours: 72,
  },
];

function getPriority(status: string, warRoom?: boolean) {
  if (warRoom) return 0;
  if (status === 'blocked') return 1;
  if (status === 'at-risk') return 2;
  if (status === 'pending') return 3;
  return 4;
}

// ── Interactive card (real scenarios) ─────────────────────────────────────
interface ScenarioCardProps {
  scenario: Scenario;
  resolvedExceptions: Set<string>;
  onClick: () => void;
}

function ScenarioCard({ scenario, resolvedExceptions, onClick }: ScenarioCardProps) {
  const statusCfg = getStatusConfig(scenario.shipment.status, scenario.warRoom);
  const modeCfg = getTransportModeCfg(scenario.shipment.mode);
  const ModeIcon = modeCfg.Icon;

  const openExceptions = scenario.exceptions.filter(
    (e) => !resolvedExceptions.has(e.id)
  ).length;
  const criticalCount = scenario.exceptions.filter(
    (e) => e.severity === 'critical' && !resolvedExceptions.has(e.id)
  ).length;

  const totalDocs = scenario.documents.length;
  const receivedDocs = scenario.documents.filter(
    (d) => d.status !== 'missing' && d.status !== 'pending'
  ).length;

  const totalBlocking = scenario.exceptions.filter((e) => e.blocking).length;
  const resolvedBlocking = scenario.exceptions.filter(
    (e) => e.blocking && resolvedExceptions.has(e.id)
  ).length;
  const readiness =
    totalBlocking === 0
      ? scenario.shipment.readinessScore
      : Math.round(
          scenario.shipment.readinessScore +
            (resolvedBlocking / totalBlocking) * (100 - scenario.shipment.readinessScore)
        );

  const readinessCfg = getReadinessConfig(readiness);
  const cutoffColor = getCutoffColor(scenario.shipment.cutoffHours);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border text-left shadow-sm',
        'transition-all duration-150 hover:shadow-md hover:border-amber-300/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        // Yellow/amber highlight for demo scenarios
        'bg-amber-50/40 ring-1 ring-amber-300/50',
        scenario.warRoom && 'ring-red-400/60 bg-red-50/30'
      )}
    >
      <div className={cn('absolute inset-y-0 left-0 w-1 rounded-l-xl', statusCfg.stripe)} />

      <div className="flex items-center gap-0 pl-5 pr-4 py-3">
        {/* ID + name */}
        <div className="min-w-[160px] flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <code className="text-sm font-bold font-mono text-foreground">
              {scenario.shipment.id}
            </code>
            {scenario.warRoom && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-red-700 uppercase">
                WAR ROOM
              </span>
            )}
            {!scenario.warRoom && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-700 uppercase">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{scenario.name}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', statusCfg.badge)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.stripe)} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Route + Carrier */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className="font-mono text-xs text-muted-foreground">{scenario.shipment.origin.port}</span>
            <span className="text-muted-foreground text-xs">{scenario.shipment.origin.city}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">{scenario.shipment.destination.port}</span>
            <span className="text-muted-foreground text-xs">{scenario.shipment.destination.city}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate flex items-center gap-1">
            <span className={cn('inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px] font-semibold shrink-0', modeCfg.bg, modeCfg.color)}>
              <ModeIcon className="h-2.5 w-2.5" />
              {modeCfg.label}
            </span>
            <span className="truncate">{scenario.shipment.carrier} · {scenario.shipment.vessel} · {scenario.shipment.voyage}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70 truncate">
            {scenario.shipment.cargoDescription}
          </p>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Exceptions */}
        <div className="text-center min-w-[64px] flex-shrink-0">
          {openExceptions > 0 ? (
            <>
              <div className={cn('text-xl font-bold tabular-nums', criticalCount > 0 ? 'text-red-600' : 'text-amber-600')}>
                {openExceptions}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">{openExceptions === 1 ? 'Exception' : 'Exceptions'}</div>
              {criticalCount > 0 && (
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] font-semibold text-red-600">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {criticalCount} Critical
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-green-600 tabular-nums">0</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Exceptions</div>
              <div className="mt-0.5 text-[9px] font-semibold text-green-600">Clean</div>
            </>
          )}
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Documents */}
        <div className="text-center min-w-[60px] flex-shrink-0">
          <div className="text-xl font-bold tabular-nums text-foreground">
            {receivedDocs}
            <span className="text-sm font-medium text-muted-foreground">/{totalDocs}</span>
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">Docs</div>
          <div className="mt-0.5 text-[9px] font-medium text-muted-foreground">Received</div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Readiness */}
        <div className="min-w-[90px] flex-shrink-0">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              <FileText className="inline h-2.5 w-2.5 mr-0.5" />
              Readiness
            </span>
            <span className={cn('text-[11px] font-bold tabular-nums', readinessCfg.text)}>
              {readiness}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', readinessCfg.bar)}
              style={{ width: `${Math.min(readiness, 100)}%` }}
            />
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Cutoff */}
        <div className="text-center min-w-[56px] flex-shrink-0">
          <div className={cn('text-base font-bold tabular-nums', cutoffColor)}>
            {formatCountdown(scenario.shipment.cutoffHours)}
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <Clock className="h-2.5 w-2.5" />
            cutoff
          </div>
        </div>

        {/* Arrow */}
        <div className="ml-3 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/60 group-hover:bg-primary/10 transition-colors">
            <ChevronRight className="h-4 w-4 text-amber-600 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Decorative (non-interactive) card ─────────────────────────────────────
function DecorativeCard({ row }: { row: DecorativeRow }) {
  const statusCfg = getStatusConfig(row.status);
  const readinessCfg = getReadinessConfig(row.readiness);
  const cutoffColor = getCutoffColor(row.cutoffHours);
  const modeCfg = getTransportModeCfg(row.mode ?? 'ocean');
  const ModeIcon = modeCfg.Icon;

  return (
    <div
      className={cn(
        'relative w-full rounded-xl border bg-card shadow-sm opacity-60 pointer-events-none select-none',
        row.status === 'blocked' && 'ring-1 ring-red-300/30'
      )}
    >
      <div className={cn('absolute inset-y-0 left-0 w-1 rounded-l-xl', statusCfg.stripe)} />

      <div className="flex items-center gap-0 pl-5 pr-4 py-3">
        {/* ID + name */}
        <div className="min-w-[160px] flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <code className="text-sm font-bold font-mono text-foreground">{row.id}</code>
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{row.name}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', statusCfg.badge)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.stripe)} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Route */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">{row.origin.port}</span>
            <span className="text-muted-foreground text-xs">{row.origin.city}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">{row.destination.port}</span>
            <span className="text-muted-foreground text-xs">{row.destination.city}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate flex items-center gap-1">
            <span className={cn('inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px] font-semibold shrink-0', modeCfg.bg, modeCfg.color)}>
              <ModeIcon className="h-2.5 w-2.5" />
              {modeCfg.label}
            </span>
            <span className="truncate">{row.carrier} · {row.vessel} · {row.voyage}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70 truncate">{row.cargoDescription}</p>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Exceptions */}
        <div className="text-center min-w-[64px] flex-shrink-0">
          <>
            <div className="text-xl font-bold text-green-600 tabular-nums">0</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Exceptions</div>
            <div className="mt-0.5 text-[9px] font-semibold text-green-600">Clean</div>
          </>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Documents */}
        <div className="text-center min-w-[60px] flex-shrink-0">
          <div className="text-xl font-bold tabular-nums text-foreground">
            {row.receivedDocs}
            <span className="text-sm font-medium text-muted-foreground">/{row.totalDocs}</span>
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">Docs</div>
          <div className="mt-0.5 text-[9px] font-medium text-muted-foreground">Received</div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Readiness */}
        <div className="min-w-[90px] flex-shrink-0">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              <FileText className="inline h-2.5 w-2.5 mr-0.5" />
              Readiness
            </span>
            <span className={cn('text-[11px] font-bold tabular-nums', readinessCfg.text)}>
              {row.readiness}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full', readinessCfg.bar)}
              style={{ width: `${Math.min(row.readiness, 100)}%` }}
            />
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Cutoff */}
        <div className="text-center min-w-[56px] flex-shrink-0">
          <div className={cn('text-base font-bold tabular-nums', cutoffColor)}>
            {formatCountdown(row.cutoffHours)}
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <Clock className="h-2.5 w-2.5" />
            cutoff
          </div>
        </div>

        {/* No arrow for decorative rows */}
        <div className="ml-3 w-8 flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Completed (cleared for handoff) card — emerald treatment ──────────────
interface CompletedScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
}

function CompletedScenarioCard({ scenario, onClick }: CompletedScenarioCardProps) {
  const modeCfg = getTransportModeCfg(scenario.shipment.mode);
  const ModeIcon = modeCfg.Icon;
  const totalDocs = scenario.documents.length;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border text-left shadow-sm',
        'transition-all duration-150 hover:shadow-md hover:border-emerald-400/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'bg-emerald-50/40 ring-1 ring-emerald-300/50'
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-emerald-500" />

      <div className="flex items-center gap-0 pl-5 pr-4 py-3">
        {/* ID + name */}
        <div className="min-w-[160px] flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <code className="text-sm font-bold font-mono text-foreground">
              {scenario.shipment.id}
            </code>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-emerald-700 uppercase">
              Cleared
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{scenario.name}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ready to Ship
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Route + Carrier */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className="font-mono text-xs text-muted-foreground">{scenario.shipment.origin.port}</span>
            <span className="text-muted-foreground text-xs">{scenario.shipment.origin.city}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">{scenario.shipment.destination.port}</span>
            <span className="text-muted-foreground text-xs">{scenario.shipment.destination.city}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate flex items-center gap-1">
            <span className={cn('inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px] font-semibold shrink-0', modeCfg.bg, modeCfg.color)}>
              <ModeIcon className="h-2.5 w-2.5" />
              {modeCfg.label}
            </span>
            <span className="truncate">{scenario.shipment.carrier} · {scenario.shipment.vessel} · {scenario.shipment.voyage}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70 truncate">
            {scenario.shipment.cargoDescription}
          </p>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Exceptions — all resolved */}
        <div className="text-center min-w-[64px] flex-shrink-0">
          <div className="text-xl font-bold text-emerald-600 tabular-nums">0</div>
          <div className="text-[10px] text-muted-foreground leading-tight">Exceptions</div>
          <div className="mt-0.5 text-[9px] font-semibold text-emerald-600">All Resolved</div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Documents */}
        <div className="text-center min-w-[60px] flex-shrink-0">
          <div className="text-xl font-bold tabular-nums text-foreground">
            {totalDocs}
            <span className="text-sm font-medium text-muted-foreground">/{totalDocs}</span>
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">Docs</div>
          <div className="mt-0.5 text-[9px] font-medium text-muted-foreground">Complete</div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Readiness — hardcoded 100% */}
        <div className="min-w-[90px] flex-shrink-0">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              <FileText className="inline h-2.5 w-2.5 mr-0.5" />
              Readiness
            </span>
            <span className="text-[11px] font-bold tabular-nums text-emerald-600">
              100%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 w-full" />
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Cleared status instead of cutoff */}
        <div className="text-center min-w-[56px] flex-shrink-0">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-[10px] font-semibold text-emerald-700">Cleared</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="ml-3 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100/60 group-hover:bg-primary/10 transition-colors">
            <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </button>
  );
}

export function ShipmentListView({
  scenarios,
  resolvedExceptions,
  completedScenarios,
  onSelect,
}: ShipmentListViewProps) {
  const totalExceptions = scenarios.reduce(
    (sum, s) => sum + s.exceptions.filter((e) => !resolvedExceptions.has(e.id)).length,
    0
  );
  const warRoomCount = scenarios.filter((s) => s.warRoom).length;
  const blockedCount = scenarios.filter(
    (s) => s.shipment.status === 'blocked' || s.warRoom
  ).length;

  // Sort real (demo) scenarios by priority — always displayed first
  const sortedScenarios = [...scenarios].sort((a, b) => {
    return getPriority(a.shipment.status, a.warRoom) - getPriority(b.shipment.status, b.warRoom);
  });

  // Feature C: Split into active (non-completed) vs completed scenarios
  const activeScenarios = sortedScenarios.filter(s => !completedScenarios.has(s.id));
  const completedList = sortedScenarios.filter(s => completedScenarios.has(s.id));

  // Sort decorative rows — always displayed last (all on-track, so priority 4)
  const sortedDecorativeRows = [...DECORATIVE_ROWS].sort(
    (a, b) => getPriority(a.status) - getPriority(b.status)
  );

  type MergedItem =
    | { kind: 'real'; scenario: Scenario }
    | { kind: 'deco'; row: DecorativeRow };

  // Active (non-completed) demo scenarios first, then decorative rows
  const allItems: MergedItem[] = [
    ...activeScenarios.map((s): MergedItem => ({ kind: 'real', scenario: s })),
    ...sortedDecorativeRows.map((r): MergedItem => ({ kind: 'deco', row: r })),
  ];

  const totalDisplay = scenarios.length + DECORATIVE_ROWS.length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">All Shipments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalDisplay} shipments · {totalExceptions} open exceptions
            {warRoomCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                <AlertTriangle className="h-2.5 w-2.5" />
                {warRoomCount} War Room
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {blockedCount > 0 && (
            <Badge variant="critical" className="text-[10px]">
              {blockedCount} Blocked
            </Badge>
          )}
        </div>
      </div>

      {/* Section label for demo scenarios */}
      {activeScenarios.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700/80">
            Active Demo Scenarios
          </span>
          <div className="flex-1 h-px bg-amber-200/60" />
          <span className="text-[10px] text-muted-foreground">{activeScenarios.length} shipment{activeScenarios.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Cards — demo scenarios first, decorative rows after */}
      <div className="space-y-2">
        {allItems.map((item, idx) => {
          // Insert section divider between demo and decorative rows
          const isDivider = item.kind === 'deco' && (idx === 0 || allItems[idx - 1].kind === 'real');
          return (
            <div key={item.kind === 'real' ? item.scenario.id : item.row.id}>
              {isDivider && (
                <div className="flex items-center gap-2 px-1 pt-2 pb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                    Other Shipments
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground">{DECORATIVE_ROWS.length} shipments · All clear</span>
                </div>
              )}
              {item.kind === 'real' ? (
                <ScenarioCard
                  scenario={item.scenario}
                  resolvedExceptions={resolvedExceptions}
                  onClick={() => onSelect(item.scenario.id)}
                />
              ) : (
                <DecorativeCard row={item.row} />
              )}
            </div>
          );
        })}
      </div>

      {/* Feature C: READY TO SHIP section — completed/cleared scenarios */}
      {completedList.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/80">
              Ready to Ship
            </span>
            <div className="flex-1 h-px bg-emerald-200/60" />
            <span className="text-[10px] text-muted-foreground">
              {completedList.length} shipment{completedList.length !== 1 ? 's' : ''} · Cleared
            </span>
          </div>
          {completedList.map(scenario => (
            <CompletedScenarioCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => onSelect(scenario.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
