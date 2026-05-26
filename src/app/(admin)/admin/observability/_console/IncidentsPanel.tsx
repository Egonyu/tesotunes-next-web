'use client';

import { useSecurityIncidents } from '@/lib/security-console/hooks';
import { EmptyState, SeverityBadge, SkeletonRows, formatWhen } from './ui';

function statusClass(status: string): string {
  switch (status) {
    case 'open':
      return 'text-rose-600 dark:text-rose-300';
    case 'investigating':
    case 'acknowledged':
      return 'text-amber-600 dark:text-amber-300';
    case 'resolved':
    case 'closed':
      return 'text-emerald-600 dark:text-emerald-300';
    default:
      return 'text-muted-foreground';
  }
}

export function IncidentsPanel() {
  const incidents = useSecurityIncidents();
  const rows = incidents.data ?? [];

  if (incidents.isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <SkeletonRows rows={6} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <EmptyState
          title="No incidents"
          description="The detection engine opens incidents automatically when correlated events cross a threshold."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Incident</th>
            <th className="px-4 py-2 font-medium">Severity</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Owner</th>
            <th className="px-4 py-2 text-right font-medium">Events</th>
            <th className="px-4 py-2 text-right font-medium">Detected</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((incident) => (
            <tr key={incident.id} className="align-top hover:bg-muted/30">
              <td className="px-4 py-2.5">
                <p className="font-medium">{incident.title}</p>
                <p className="truncate text-xs text-muted-foreground">{incident.summary}</p>
              </td>
              <td className="px-4 py-2.5">
                <SeverityBadge severity={incident.severity} />
              </td>
              <td className={`px-4 py-2.5 text-xs font-medium ${statusClass(incident.status)}`}>
                {incident.status}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {incident.owner?.name ?? 'Unassigned'}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">{incident.event_count}</td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {formatWhen(incident.detected_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
