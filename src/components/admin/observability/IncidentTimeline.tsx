'use client';

import type { IncidentRow } from '@/types/observability';

interface IncidentTimelineProps {
  incidents: IncidentRow[];
  selectedIncidentId?: number | null;
  onSelect?: (incident: IncidentRow) => void;
}

export function IncidentTimeline({ incidents, selectedIncidentId, onSelect }: IncidentTimelineProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Incident Timeline</h3>
      <div className="mt-4 space-y-3">
        {incidents.slice(0, 8).map((incident) => (
          <button
            key={incident.id}
            type="button"
            onClick={() => onSelect?.(incident)}
            className={`block w-full rounded-xl border px-4 py-3 text-left ${selectedIncidentId === incident.id ? 'border-foreground bg-muted/40' : ''}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{incident.title}</p>
              <span className="text-xs uppercase text-muted-foreground">{incident.status}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{incident.detected_at ? new Date(incident.detected_at).toLocaleString() : 'Unknown time'}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border px-2 py-1">{incident.severity}</span>
              <span className="rounded-full border px-2 py-1">{incident.owner?.name ?? 'Unassigned'}</span>
              <span className="rounded-full border px-2 py-1">{incident.note_count ?? 0} notes</span>
              <span className="rounded-full border px-2 py-1">{incident.activity_count ?? 0} actions</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
