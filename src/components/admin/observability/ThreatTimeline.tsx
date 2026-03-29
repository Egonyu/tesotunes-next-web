'use client';

import type { ObservabilityEvent } from '@/types/observability';

export function ThreatTimeline({ events }: { events: ObservabilityEvent[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Threat Timeline</h3>
      <div className="mt-4 space-y-3">
        {events.slice(0, 8).map((event) => (
          <div key={event.id} className="flex gap-3 border-l-2 border-muted pl-4">
            <div className="pt-0.5 text-xs text-muted-foreground">{event.occurred_at ? new Date(event.occurred_at).toLocaleTimeString() : '--'}</div>
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.source.ip ?? 'Unknown IP'} • {event.outcome} • risk {event.risk.score}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
