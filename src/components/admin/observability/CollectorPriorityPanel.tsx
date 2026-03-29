'use client';

import type { ObservabilityEvent } from '@/types/observability';

interface CollectorPriorityPanelProps {
  title: string;
  events: ObservabilityEvent[];
  onSelect?: (event: ObservabilityEvent) => void;
}

export function CollectorPriorityPanel({ title, events, onSelect }: CollectorPriorityPanelProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Highest-risk collector-fed signals ranked for fast triage.
      </p>
      <div className="mt-4 space-y-3">
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No prioritized collector alerts in this time window.
          </div>
        ) : (
          events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect?.(event)}
              className="block w-full rounded-xl border p-4 text-left hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {event.infra.host ?? event.target.resource_id ?? 'unknown host'} · {event.attack.pattern ?? 'unclassified'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{event.risk.score}</div>
                  <div className="text-xs text-muted-foreground capitalize">{event.severity}</div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
