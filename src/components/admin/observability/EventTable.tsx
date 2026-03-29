'use client';

import type { ObservabilityEvent } from '@/types/observability';

interface EventTableProps {
  events: ObservabilityEvent[];
  onSelect?: (event: ObservabilityEvent) => void;
}

export function EventTable({ events, onSelect }: EventTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {events.map((event) => (
              <tr
                key={event.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => onSelect?.(event)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : 'Unknown time'}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{event.source.ip ?? 'Unknown IP'}</p>
                  <p className="text-xs text-muted-foreground">{event.actor.label ?? event.actor.type ?? 'Unknown actor'}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{event.target.route ?? 'No route'}</p>
                  <p className="text-xs text-muted-foreground">{event.domain} / {event.category}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border px-2 py-1 text-xs capitalize">{event.outcome}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{event.risk.score}</p>
                  <p className="text-xs text-muted-foreground">{event.severity}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
