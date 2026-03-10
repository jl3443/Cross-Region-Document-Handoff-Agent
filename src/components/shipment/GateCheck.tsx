import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  // Display statuses may lag behind actual statuses during sequential animation
  const [displayStatuses, setDisplayStatuses] = useState<GateStatus[]>(() =>
    gates.map((g) => g.status)
  );
  // Track which gate indices are currently mid-animation (pop effect)
  const [passingSet, setPassingSet] = useState<Set<number>>(new Set());
  const prevGatesRef = useRef<Gate[]>(gates);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const prev = prevGatesRef.current;
    prevGatesRef.current = gates;

    // Clear any pending sequential timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Find gates that newly became 'passed' this render cycle
    const newlyPassedIndices: number[] = [];
    gates.forEach((gate, idx) => {
      if (gate.status === 'passed' && prev[idx]?.status !== 'passed') {
        newlyPassedIndices.push(idx);
      }
    });

    if (newlyPassedIndices.length === 0) {
      // No new gates passing — sync display immediately
      setDisplayStatuses(gates.map((g) => g.status));
      return;
    }

    // Keep newly-passing gates at their old status until their animation slot arrives
    setDisplayStatuses(
      gates.map((g, idx) =>
        newlyPassedIndices.includes(idx) ? prev[idx]?.status ?? g.status : g.status
      )
    );

    // Schedule each newly-passing gate sequentially (650 ms apart)
    newlyPassedIndices.forEach((gateIdx, order) => {
      const delay = order * 650 + 250;

      const t1 = setTimeout(() => {
        // Flip this gate to 'passed' and trigger the pop animation
        setDisplayStatuses((cur) => {
          const next = [...cur];
          next[gateIdx] = 'passed';
          return next;
        });
        setPassingSet((cur) => new Set([...cur, gateIdx]));

        // Remove pop-animation flag after it finishes
        const t2 = setTimeout(() => {
          setPassingSet((cur) => {
            const next = new Set(cur);
            next.delete(gateIdx);
            return next;
          });
        }, 500);
        timersRef.current.push(t2);
      }, delay);

      timersRef.current.push(t1);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [gates]);

  return (
    <div className="flex items-start justify-between">
      {gates.map((gate, idx) => {
        const displayStatus = displayStatuses[idx] ?? gate.status;
        const config = gateConfig[displayStatus];
        const Icon = config.icon;
        const isPassing = passingSet.has(idx);

        return (
          <div key={gate.name} className="flex items-start" style={{ flex: 1 }}>
            {/* Gate circle + label */}
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full ring-2',
                  config.bg,
                  config.ring
                )}
                animate={isPassing ? { scale: [1, 1.32, 0.92, 1] } : { scale: 1 }}
                transition={
                  isPassing
                    ? { duration: 0.42, ease: 'easeOut' }
                    : { duration: 0.2 }
                }
              >
                <Icon size={16} className={config.iconClass} />
              </motion.div>
              <span className="mt-1.5 text-center text-[10px] font-medium leading-tight text-slate-500">
                {gate.name}
              </span>
            </div>

            {/* Connector line — transitions to green with CSS */}
            {idx < gates.length - 1 && (
              <div className="flex flex-1 items-center px-1 pt-[18px]">
                <div
                  className={cn(
                    'h-0.5 w-full rounded-full transition-colors duration-500',
                    connectorColor(displayStatus)
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
