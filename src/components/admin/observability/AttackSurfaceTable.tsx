'use client';

import type { EntryPointRow } from '@/types/observability';

export function AttackSurfaceTable({ entries }: { entries: EntryPointRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Entry Point</th>
              <th className="px-4 py-3">Exposure</th>
              <th className="px-4 py-3">Traffic</th>
              <th className="px-4 py-3">Failures</th>
              <th className="px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map((entry) => (
              <tr key={entry.entry_key}>
                <td className="px-4 py-3">
                  <p className="font-medium">{entry.label}</p>
                  <p className="text-xs text-muted-foreground">{entry.route_pattern}</p>
                </td>
                <td className="px-4 py-3 capitalize">{entry.exposure_type}</td>
                <td className="px-4 py-3">{entry.totals.hits} hits / {entry.totals.unique_sources} sources</td>
                <td className="px-4 py-3">{entry.totals.blocked + entry.totals.failed + entry.totals.suspicious}</td>
                <td className="px-4 py-3">{entry.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
