import { ArrowRight, Ship, AlertTriangle, FileText, Clock, ChevronRight } from 'lucide-react';
import type { Scenario } from '@/data/types';
import { cn, formatCountdown, getCutoffColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ShipmentListViewProps {
  scenarios: Scenario[];
  resolvedExceptions: Set<string>;
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

// ── Decorative (non-interactive) row data ──────────────────────────────────
interface DecorativeRow {
  id: string;
  name: string;
  status: 'on-track' | 'at-risk' | 'blocked' | 'pending';
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
    status: 'pending',
    origin: { city: 'Melbourne', port: 'AUMEL' },
    destination: { city: 'Los Angeles', port: 'USLAX' },
    carrier: 'COSCO',
    vessel: 'COSCO Galaxy',
    voyage: 'V.112W',
    cargoDescription: 'Industrial Machinery Parts',
    readiness: 58,
    exceptions: 2,
    criticalExceptions: 0,
    totalDocs: 8,
    receivedDocs: 5,
    cutoffHours: 28,
  },
  {
    id: 'SHP-20486',
    name: 'ISF Filing Pending',
    status: 'pending',
    origin: { city: 'Shanghai', port: 'CNSHA' },
    destination: { city: 'Seattle', port: 'USSEA' },
    carrier: 'Evergreen',
    vessel: 'Ever Ace',
    voyage: 'V.031E',
    cargoDescription: 'Consumer Electronics',
    readiness: 62,
    exceptions: 1,
    criticalExceptions: 0,
    totalDocs: 6,
    receivedDocs: 4,
    cutoffHours: 36,
  },
  {
    id: 'SHP-20480',
    name: 'Pending Review',
    status: 'pending',
    origin: { city: 'Singapore', port: 'SGSIN' },
    destination: { city: 'Houston', port: 'USHOU' },
    carrier: 'MSC',
    vessel: 'MSC Ambra',
    voyage: 'V.218N',
    cargoDescription: 'Pharmaceutical Ingredients',
    readiness: 71,
    exceptions: 1,
    criticalExceptions: 0,
    totalDocs: 7,
    receivedDocs: 5,
    cutoffHours: 42,
  },
  {
    id: 'SHP-20479',
    name: 'Docs Pending',
    status: 'pending',
    origin: { city: 'Shenzhen', port: 'CNSZX' },
    destination: { city: 'Long Beach', port: 'USLGB' },
    carrier: 'Yang Ming',
    vessel: 'YM Wish',
    voyage: 'V.097W',
    cargoDescription: 'Auto Parts & Accessories',
    readiness: 65,
    exceptions: 1,
    criticalExceptions: 0,
    totalDocs: 5,
    receivedDocs: 3,
    cutoffHours: 48,
  },
  {
    id: 'SHP-20477',
    name: 'Pending Customs Clearance',
    status: 'pending',
    origin: { city: 'Osaka', port: 'JPOSA' },
    destination: { city: 'Los Angeles', port: 'USLAX' },
    carrier: 'ONE',
    vessel: 'ONE Continuity',
    voyage: 'V.044E',
    cargoDescription: 'Precision Instruments',
    readiness: 74,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 6,
    receivedDocs: 5,
    cutoffHours: 56,
  },
  {
    id: 'SHP-20484',
    name: 'Docs Under Review',
    status: 'pending',
    origin: { city: 'Rotterdam', port: 'NLRTM' },
    destination: { city: 'Boston', port: 'USBOS' },
    carrier: 'Hapag-Lloyd',
    vessel: 'HL Colombo',
    voyage: 'V.019W',
    cargoDescription: 'Chemical Products (Non-DG)',
    readiness: 68,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 7,
    receivedDocs: 5,
    cutoffHours: 60,
  },
  {
    id: 'SHP-20475',
    name: 'Pending Validation',
    status: 'pending',
    origin: { city: 'Hamburg', port: 'DEHAM' },
    destination: { city: 'New York', port: 'USNYC' },
    carrier: 'Maersk',
    vessel: 'Maersk Taurus',
    voyage: 'V.116W',
    cargoDescription: 'Machinery & Equipment',
    readiness: 72,
    exceptions: 0,
    criticalExceptions: 0,
    totalDocs: 5,
    receivedDocs: 4,
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
        'group relative w-full rounded-xl border bg-card text-left shadow-sm',
        'transition-all duration-150 hover:shadow-md hover:border-primary/30',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        scenario.warRoom && 'ring-1 ring-red-400/40'
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
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            <Ship className="inline h-3 w-3 mr-1" />
            {scenario.shipment.carrier} · {scenario.shipment.vessel} · {scenario.shipment.voyage}
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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

  return (
    <div
      className={cn(
        'relative w-full rounded-xl border bg-card shadow-sm opacity-70 pointer-events-none select-none',
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
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            <Ship className="inline h-3 w-3 mr-1" />
            {row.carrier} · {row.vessel} · {row.voyage}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70 truncate">{row.cargoDescription}</p>
        </div>

        <Separator orientation="vertical" className="h-10 mx-3" />

        {/* Exceptions */}
        <div className="text-center min-w-[64px] flex-shrink-0">
          {row.exceptions > 0 ? (
            <>
              <div className={cn('text-xl font-bold tabular-nums', row.criticalExceptions > 0 ? 'text-red-600' : 'text-amber-600')}>
                {row.exceptions}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">{row.exceptions === 1 ? 'Exception' : 'Exceptions'}</div>
              {row.criticalExceptions > 0 && (
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] font-semibold text-red-600">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {row.criticalExceptions} Critical
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

export function ShipmentListView({
  scenarios,
  resolvedExceptions,
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

  // Sort real scenarios by priority
  const sortedScenarios = [...scenarios].sort((a, b) => {
    return getPriority(a.shipment.status, a.warRoom) - getPriority(b.shipment.status, b.warRoom);
  });

  // Sort decorative rows by priority too
  const sortedDecorativeRows = [...DECORATIVE_ROWS].sort(
    (a, b) => getPriority(a.status) - getPriority(b.status)
  );

  // Interleave: real scenarios first by priority, then decorative rows fill in
  // Merge by priority level for a natural-looking list
  type MergedItem =
    | { kind: 'real'; scenario: Scenario }
    | { kind: 'deco'; row: DecorativeRow };

  const realItems: MergedItem[] = sortedScenarios.map((s) => ({ kind: 'real', scenario: s }));
  const decoItems: MergedItem[] = sortedDecorativeRows.map((r) => ({ kind: 'deco', row: r }));

  // Interleave: insert decorative rows after same-priority real rows
  const allItems: MergedItem[] = [];
  let decoIdx = 0;
  for (const item of realItems) {
    allItems.push(item);
  }
  // Insert decorative rows at appropriate positions
  for (const decoItem of decoItems) {
    const decoRow = decoItem as { kind: 'deco'; row: DecorativeRow };
    const decoPri = getPriority(decoRow.row.status);
    // Find insertion point: after all real items with same or lower priority number
    let insertAt = allItems.length;
    for (let i = 0; i < allItems.length; i++) {
      const it = allItems[i];
      const realPri = it.kind === 'real' ? getPriority(it.scenario.shipment.status, it.scenario.warRoom) : getPriority((it as { kind: 'deco'; row: DecorativeRow }).row.status);
      if (realPri > decoPri) {
        insertAt = i;
        break;
      }
    }
    allItems.splice(insertAt + decoIdx, 0, decoItem);
    decoIdx++;
  }
  // Reset decoIdx and redo cleanly — just append decorative in sorted order after real
  // Actually let's do a simpler merge: sort all together
  const allItemsSimple: MergedItem[] = [
    ...realItems,
    ...decoItems,
  ].sort((a, b) => {
    const getPri = (item: MergedItem) => {
      if (item.kind === 'real') return getPriority(item.scenario.shipment.status, item.scenario.warRoom);
      return getPriority(item.row.status);
    };
    const diff = getPri(a) - getPri(b);
    if (diff !== 0) return diff;
    // Real items before decorative at same priority
    if (a.kind === 'real' && b.kind === 'deco') return -1;
    if (a.kind === 'deco' && b.kind === 'real') return 1;
    return 0;
  });

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

      {/* Cards — real + decorative, sorted by priority */}
      <div className="space-y-2">
        {allItemsSimple.map((item) =>
          item.kind === 'real' ? (
            <ScenarioCard
              key={item.scenario.id}
              scenario={item.scenario}
              resolvedExceptions={resolvedExceptions}
              onClick={() => onSelect(item.scenario.id)}
            />
          ) : (
            <DecorativeCard key={item.row.id} row={item.row} />
          )
        )}
      </div>
    </div>
  );
}
