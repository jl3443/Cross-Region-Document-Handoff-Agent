import { Sparkles, Upload, ChevronDown, Bell } from 'lucide-react';
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

const statusConfig: Record<string, { label: string; dotClass: string; bgClass: string }> = {
  'on-track': { label: 'On Track', dotClass: 'bg-emerald-500', bgClass: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
  'at-risk': { label: 'At Risk', dotClass: 'bg-amber-500', bgClass: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  blocked: { label: 'Blocked', dotClass: 'bg-red-500', bgClass: 'bg-red-500/10 text-red-400 ring-red-500/20' },
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
    <header className="flex h-14 items-center justify-between border-b border-neutral-800 bg-[#0a0a0a] px-6">
      {/* Left: View Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold text-white">{title}</h1>
        <div className="h-4 w-px bg-neutral-800" />
        <code className="rounded-md bg-neutral-800/50 px-2.5 py-1 font-mono text-xs font-medium text-neutral-300 ring-1 ring-neutral-700/50">
          {shipmentId}
        </code>
        <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1', status.bgClass)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', status.dotClass)} />
          {status.label}
        </div>
      </div>

      {/* Center: Scenario Selector */}
      <div className="flex items-center">
        <div className="flex items-center gap-1 rounded-lg bg-neutral-900 p-1 ring-1 ring-neutral-800">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenario;
            return (
              <button
                key={scenario.id}
                onClick={() => onScenarioChange(scenario.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                )}
              >
                {scenario.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAiToggle}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
            aiPanelOpen
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white ring-1 ring-neutral-700'
          )}
        >
          <Sparkles size={14} />
          <span>AI Assistant</span>
        </button>
        <button
          onClick={onImportScenario}
          className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-all duration-200 hover:bg-neutral-700 hover:text-white ring-1 ring-neutral-700"
        >
          <Upload size={14} />
          <span>Import</span>
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
