'use client';

import type { DatabaseCollectorBreakdownRow } from '@/types/observability';

interface DatabaseCollectorPanelProps {
  breakdown: DatabaseCollectorBreakdownRow[];
}

export function DatabaseCollectorPanel({ breakdown }: DatabaseCollectorPanelProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">Collector DB Signals</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Classified database anomalies flowing in from collector-fed infrastructure sources.
      </p>
      <div className="mt-4 space-y-3">
        {breakdown.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No collector-fed database anomalies in this time window.
          </div>
        ) : breakdown.map((row) => (
          <div key={row.type} className="rounded-xl border px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.type.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.events} events · max risk {row.max_risk_score}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{row.last_seen_at ?? 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
