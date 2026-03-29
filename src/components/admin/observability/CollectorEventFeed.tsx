'use client';

import type { ObservabilityEvent } from '@/types/observability';
import { EventTable } from '@/components/admin/observability/EventTable';

interface CollectorEventFeedProps {
  title: string;
  events: ObservabilityEvent[];
  onSelect?: (event: ObservabilityEvent) => void;
}

export function CollectorEventFeed({ title, events, onSelect }: CollectorEventFeedProps) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Recent collector-fed infrastructure events normalized into the shared observability pipeline.
        </p>
      </div>
      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
          No collector-fed events are available in this time window.
        </div>
      ) : (
        <EventTable events={events} onSelect={onSelect} />
      )}
    </div>
  );
}
