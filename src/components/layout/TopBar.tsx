import { Sparkles, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ScenarioOption {
  id: string;
  name: string;
  shipmentId?: string;
  exceptionStatus?: string;
  severity?: string;
}

const exStatusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  waiting: 'bg-amber-100 text-amber-700',
  'in-review': 'bg-purple-100 text-purple-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
};

const severityDot: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-400',
};

interface TopBarProps {
  title: string;
  scenarios: ScenarioOption[];
  activeScenario: string;
  onScenarioChange: (scenarioId: string) => void;
  shipmentId: string;
  shipmentStatus: 'on-track' | 'at-risk' | 'blocked';
  onAiToggle: () => void;
  aiPanelOpen?: boolean;
  onImportScenario: () => void;
  showScenarios?: boolean;
}

const statusConfig: Record<string, { label: string; dotClass: string; textClass: string }> = {
  'on-track': { label: 'On Track', dotClass: 'bg-green-500', textClass: 'text-green-700' },
  'at-risk': { label: 'At Risk', dotClass: 'bg-amber-500', textClass: 'text-amber-700' },
  blocked: { label: 'Blocked', dotClass: 'bg-red-500', textClass: 'text-red-700' },
};

export function TopBar({
  title,
  scenarios,
  activeScenario,
  onScenarioChange,
  shipmentId,
  shipmentStatus,
  onAiToggle,
  aiPanelOpen,
  onImportScenario,
  showScenarios = false,
}: TopBarProps) {
  const status = statusConfig[shipmentStatus] ?? statusConfig['on-track'];

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 shrink-0">
      {/* Left: View Title */}
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      {/* Center: Scenario Selector Pills — only shown when viewing a specific shipment */}
      {showScenarios ? (
        <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenario;
            return (
              <button
                key={scenario.id}
                onClick={() => onScenarioChange(scenario.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {scenario.shipmentId && scenario.exceptionStatus ? (
                  <span className="flex items-center gap-1.5">
                    {scenario.severity && (
                      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', severityDot[scenario.severity] ?? 'bg-slate-400')} />
                    )}
                    <code className="font-mono text-[10px]">{scenario.shipmentId}</code>
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-semibold', exStatusColors[scenario.exceptionStatus] ?? 'bg-slate-100 text-slate-600')}>
                      {scenario.exceptionStatus}
                    </span>
                  </span>
                ) : (
                  scenario.name
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div />
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAiToggle}
          className={cn(
            'gap-1.5 px-2.5 text-xs h-8',
            aiPanelOpen
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <Sparkles className="size-3.5" />
          AI
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onImportScenario}
          className="gap-1.5 px-2.5 text-xs h-8 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Upload className="size-3.5" />
          Import
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-foreground">
          {shipmentId}
        </code>
        <div className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', status.dotClass)} />
          <span className={cn('text-xs font-medium', status.textClass)}>
            {status.label}
          </span>
        </div>
      </div>
    </header>
  );
}
