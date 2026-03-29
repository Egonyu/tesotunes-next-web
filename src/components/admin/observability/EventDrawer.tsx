'use client';

import type { ObservabilityEvent } from '@/types/observability';

export function EventDrawer({ event }: { event: ObservabilityEvent | null }) {
  if (!event) return null;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Selected Event</h3>
      <p className="mt-3 text-lg font-semibold">{event.title}</p>
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Source</p>
          <p>{event.source.ip ?? 'Unknown IP'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Target</p>
          <p>{event.target.route ?? 'No route'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Outcome</p>
          <p>{event.outcome}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Risk</p>
          <p>{event.risk.score}</p>
        </div>
      </div>
    </div>
  );
}
