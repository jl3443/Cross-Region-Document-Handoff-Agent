import { Check, X, Lock, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

type GateStatus = 'passed' | 'active' | 'blocked' | 'locked';

interface Gate {
  name: string;
  status: GateStatus;
}

interface GateCheckProps {
  gates: Gate[];
}

const gateConfig: Record<
  GateStatus,
  { bg: string; ring: string; icon: React.ElementType; iconClass: string }
> = {
  passed: {
    bg: 'bg-green-100',
    ring: 'ring-green-300',
    icon: Check,
    iconClass: 'text-green-600',
  },
  active: {
    bg: 'bg-blue-100',
    ring: 'ring-blue-300',
    icon: MoreHorizontal,
    iconClass: 'text-blue-600 animate-pulse',
  },
  blocked: {
    bg: 'bg-red-100',
    ring: 'ring-red-300',
    icon: X,
    iconClass: 'text-red-600',
  },
  locked: {
    bg: 'bg-slate-100',
    ring: 'ring-slate-200',
    icon: Lock,
    iconClass: 'text-slate-400',
  },
};

function connectorColor(leftStatus: GateStatus): string {
  if (leftStatus === 'passed') return 'bg-green-400';
  return 'bg-slate-200';
}

export function GateCheck({ gates }: GateCheckProps) {
  return (
    <div className="flex items-start justify-between">
      {gates.map((gate, idx) => {
        const config = gateConfig[gate.status];
        const Icon = config.icon;

        return (
          <div key={gate.name} className="flex items-start" style={{ flex: 1 }}>
            {/* Gate circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full ring-2',
                  config.bg,
                  config.ring
                )}
              >
                <Icon size={16} className={config.iconClass} />
              </div>
              <span className="mt-1.5 text-center text-[10px] font-medium leading-tight text-slate-500">
                {gate.name}
              </span>
            </div>

            {/* Connector line */}
            {idx < gates.length - 1 && (
              <div className="flex flex-1 items-center px-1 pt-[18px]">
                <div
                  className={cn(
                    'h-0.5 w-full rounded-full',
                    connectorColor(gate.status)
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
