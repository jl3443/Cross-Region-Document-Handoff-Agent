import type { TimelineEvent } from '../../data/types';

interface ResolutionTimelineProps {
  events: TimelineEvent[];
}

const dotColorMap: Record<TimelineEvent['type'], string> = {
  system: 'bg-[#0000B3]',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  positive: 'bg-green-500',
  info: 'bg-slate-400',
};

const dotRingMap: Record<TimelineEvent['type'], string> = {
  system: 'ring-[#0000B3]/20',
  warning: 'ring-amber-500/20',
  critical: 'ring-red-500/20',
  positive: 'ring-green-500/20',
  info: 'ring-slate-400/20',
};

function formatTimestamp(raw: string): string {
  try {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart} · ${timePart}`;
    }
  } catch {
    // fall through
  }
  return raw;
}

export function ResolutionTimeline({ events }: ResolutionTimelineProps) {
  // Newest first
  const orderedEvents = [...events].reverse();

  return (
    <div className="space-y-0">
      {orderedEvents.map((event, idx) => {
        const isLast = idx === orderedEvents.length - 1;

        return (
          <div
            key={event.id}
            className="group relative flex gap-4 rounded-md px-2 py-1 transition-colors hover:bg-slate-50"
          >
            {/* Timestamp column */}
            <div className="w-28 shrink-0 pt-0.5 text-right">
              <span className="text-[10px] font-medium leading-tight text-slate-400 whitespace-nowrap">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>

            {/* Dot + connecting line column */}
            <div className="relative flex flex-col items-center">
              <div
                className={`z-10 h-3 w-3 shrink-0 rounded-full ring-4 ${dotColorMap[event.type]} ${dotRingMap[event.type]}`}
              />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-slate-200" style={{ minHeight: 20 }} />
              )}
            </div>

            {/* Description column */}
            <div className="flex-1 pb-3 pt-0">
              <p className="text-sm leading-snug text-slate-700 group-hover:text-slate-900">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
