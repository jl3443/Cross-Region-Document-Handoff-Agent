import type { TimelineEvent } from '../../data/types';

interface ResolutionTimelineProps {
  events: TimelineEvent[];
}

const dotColorMap: Record<TimelineEvent['type'], string> = {
  system: 'bg-blue-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  positive: 'bg-emerald-500',
  info: 'bg-neutral-500',
};

const dotRingMap: Record<TimelineEvent['type'], string> = {
  system: 'ring-blue-500/20',
  warning: 'ring-amber-500/20',
  critical: 'ring-red-500/20',
  positive: 'ring-emerald-500/20',
  info: 'ring-neutral-500/20',
};

function formatTimestamp(raw: string): string {
  // Accepts ISO strings or simple time strings
  try {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch {
    // fall through
  }
  return raw;
}

export function ResolutionTimeline({ events }: ResolutionTimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;

        return (
          <div
            key={event.id}
            className="group relative flex gap-4 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-800/30"
          >
            {/* Timestamp column */}
            <div className="w-20 shrink-0 pt-0.5 text-right">
              <span className="text-xs font-medium text-neutral-500">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>

            {/* Dot + connecting line column */}
            <div className="relative flex flex-col items-center">
              <div
                className={`z-10 h-3 w-3 shrink-0 rounded-full ring-4 ${dotColorMap[event.type]} ${dotRingMap[event.type]}`}
              />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-neutral-800" style={{ minHeight: 20 }} />
              )}
            </div>

            {/* Description column */}
            <div className="flex-1 pb-3 pt-0">
              <p className="text-sm leading-snug text-neutral-300 group-hover:text-white">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
