'use client';

import type { SystemHostDetail } from '@/types/observability';

interface SystemRollupPanelProps {
  rollups?: SystemHostDetail['rollups'] | null;
}

export function SystemRollupPanel({ rollups }: SystemRollupPanelProps) {
  const rows = rollups?.domains ?? [];

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">Recent Domain Rollups</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Hourly rollups from maintenance jobs showing whether system or database pressure is persisting.
      </p>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No hourly rollups have been generated yet.
          </div>
        ) : (
          rows.map((row, index) => (
            <div key={`${row.dimension_key}-${row.bucket_start ?? index}`} className="flex items-center justify-between gap-4 rounded-xl border p-4 text-sm">
              <div>
                <div className="font-medium capitalize">{row.dimension_key}</div>
                <div className="text-xs text-muted-foreground">{row.bucket_start ?? 'Unknown bucket'}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{row.total_events} events</div>
                <div className="text-xs text-muted-foreground">
                  suspicious {row.suspicious_events} · avg risk {row.avg_risk_score}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
