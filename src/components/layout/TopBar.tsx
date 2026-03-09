import { Sparkles, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ScenarioOption {
  id: string;
  name: string;
}

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
}: TopBarProps) {
  const status = statusConfig[shipmentStatus] ?? statusConfig['on-track'];

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      {/* Left: View Title */}
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      {/* Center: Scenario Selector Pills */}
      <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenario;
          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioChange(scenario.id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {scenario.name}
            </button>
          );
        })}
      </div>

      {/* Right: AI toggle + Import + Shipment ID + Status */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAiToggle}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
            aiPanelOpen
              ? 'bg-[#0000B3] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
          )}
          title="AI Assistant"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI</span>
        </button>
        <button
          onClick={onImportScenario}
          className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
          title="Import Scenario"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Import</span>
        </button>
        <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
          {shipmentId}
        </code>
        <div className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', status.dotClass)} />
          <span className={cn('text-xs font-medium', status.textClass)}>
            {status.label}
          </span>
        </div>
      </div>
    </header>
  );
}
