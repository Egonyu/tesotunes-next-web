'use client';

import { useState } from 'react';
import type { IncidentActivityEntry, IncidentDetail, IncidentNoteEntry, IncidentRow, ObservabilityEvent } from '@/types/observability';
import { EventTable } from '@/components/admin/observability/EventTable';
import { RawEvidencePanel } from '@/components/admin/observability/RawEvidencePanel';
import { IncidentActivityTimeline } from '@/components/admin/observability/IncidentActivityTimeline';
import { IncidentEntityPivots } from '@/components/admin/observability/IncidentEntityPivots';
import type { ObservabilityEntity } from '@/types/observability';

interface IncidentDetailPanelProps {
  incident: IncidentRow | null;
  detail?: IncidentDetail | null;
  selectedEvent?: ObservabilityEvent | null;
  onSelectEvent?: (event: ObservabilityEvent) => void;
  onAssignToMe?: (incident: IncidentRow) => void;
  onReleaseOwnership?: (incident: IncidentRow) => void;
  onAttachSelectedEvent?: (incident: IncidentRow, event: ObservabilityEvent) => void;
  onAppendNote?: (incident: IncidentRow, note: string) => void;
  onSetStatus?: (incident: IncidentRow, status: string) => void;
  onPivotEntity?: (entity: ObservabilityEntity) => void;
  isSaving?: boolean;
}

export function IncidentDetailPanel({
  incident,
  detail,
  selectedEvent,
  onSelectEvent,
  onAssignToMe,
  onReleaseOwnership,
  onAttachSelectedEvent,
  onAppendNote,
  onSetStatus,
  onPivotEntity,
  isSaving = false,
}: IncidentDetailPanelProps) {
  const activity = ((detail?.incident.metadata?.activity as IncidentActivityEntry[] | undefined) ?? []);
  const noteEntries = ((detail?.incident.metadata?.note_entries as IncidentNoteEntry[] | undefined) ?? []);
  const linkedEventIds = detail?.incident.event_ids ?? incident?.event_ids ?? [];
  const isSelectedEventLinked = !!incident && !!selectedEvent && linkedEventIds.includes(selectedEvent.id);
  const [noteDraft, setNoteDraft] = useState('');

  if (!incident) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Incident Detail</h3>
        <p className="mt-3 text-sm text-muted-foreground">Select an incident to inspect linked events, entities, and timeline context.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Incident Detail</h3>
          <p className="mt-2 text-lg font-semibold">{incident.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{incident.summary ?? incident.notes ?? 'No summary available'}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Owner: {incident.owner?.name ?? 'Unassigned'}
          </p>
          {selectedEvent ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Selected event {selectedEvent.id}: {isSelectedEventLinked ? 'already linked to this incident' : 'not linked yet'}
            </p>
          ) : null}
        </div>
        <div className="space-y-2 text-right text-xs text-muted-foreground">
          <p>Status: {incident.status}</p>
          <p>Severity: {incident.severity}</p>
          <div className="flex flex-wrap justify-end gap-2">
            {['investigating', 'contained', 'resolved'].map((status) => (
              <button
                key={status}
                type="button"
                disabled={isSaving || incident.status === status}
                onClick={() => onSetStatus?.(incident, status)}
                className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark {status}
              </button>
            ))}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onAssignToMe?.(incident)}
              className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Assign to me
            </button>
            <button
              type="button"
              disabled={isSaving || !incident.owner}
              onClick={() => onReleaseOwnership?.(incident)}
              className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Release ownership
            </button>
            <button
              type="button"
              disabled={!selectedEvent || isSaving}
              onClick={() => selectedEvent && onAttachSelectedEvent?.(incident, selectedEvent)}
              className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSelectedEventLinked ? 'Detach selected event' : 'Attach selected event'}
            </button>
          </div>
        </div>
      </div>

      {detail ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border px-4 py-3">
              <p className="text-xs text-muted-foreground">Events</p>
              <p className="mt-1 text-lg font-semibold">{detail.summary.event_count}</p>
            </div>
            <div className="rounded-xl border px-4 py-3">
              <p className="text-xs text-muted-foreground">Entities</p>
              <p className="mt-1 text-lg font-semibold">{detail.summary.entity_count}</p>
            </div>
            <div className="rounded-xl border px-4 py-3">
              <p className="text-xs text-muted-foreground">Max Risk</p>
              <p className="mt-1 text-lg font-semibold">{detail.summary.max_risk_score}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
            <EventTable events={detail.events} onSelect={onSelectEvent} />
            <IncidentActivityTimeline activity={activity} />
          </div>

          <div className="rounded-2xl border p-5">
            <h4 className="text-sm font-semibold">Case Notes</h4>
            <div className="mt-3 space-y-3">
              {noteEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No note entries recorded yet.</p>
              ) : noteEntries.slice().reverse().map((entry, index) => (
                <div key={`${entry.created_at}-${index}`} className="rounded-xl border px-4 py-3">
                  <p className="text-sm">{entry.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {entry.created_by?.name ? `By ${entry.created_by.name} · ` : ''}
                    {entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Append a new case note"
                className="min-h-24 w-full rounded-xl border bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={isSaving || !noteDraft.trim()}
                onClick={() => {
                  const nextNote = noteDraft.trim();
                  if (!nextNote) return;
                  onAppendNote?.(incident, nextNote);
                  setNoteDraft('');
                }}
                className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Append case note
              </button>
            </div>
          </div>

          <RawEvidencePanel data={{
            sources: detail.summary.sources,
            domains: detail.summary.domains,
            outcomes: detail.summary.outcomes,
            entities: detail.entities,
          }} />

          <IncidentEntityPivots entities={detail.entities} onPivot={(entity) => onPivotEntity?.(entity)} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Loading incident context...</p>
      )}
    </div>
  );
}
