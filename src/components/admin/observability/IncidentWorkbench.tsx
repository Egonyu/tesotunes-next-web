'use client';

import { useEffect, useState } from 'react';
import type { IncidentRow, ObservabilityEvent } from '@/types/observability';

interface IncidentWorkbenchProps {
  selectedEvent: ObservabilityEvent | null;
  incidents: IncidentRow[];
  onCreate: (payload: { title: string; severity: string; summary?: string; notes?: string; event_ids: number[] }) => void;
  onUpdate: (incidentId: number, payload: { status?: string; severity?: string; notes?: string; event_ids?: number[] }) => void;
  isSaving?: boolean;
}

export function IncidentWorkbench({
  selectedEvent,
  incidents,
  onCreate,
  onUpdate,
  isSaving = false,
}: IncidentWorkbenchProps) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('high');
  const [notes, setNotes] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | ''>('');
  const [incidentStatus, setIncidentStatus] = useState('open');
  const [incidentSeverity, setIncidentSeverity] = useState('high');
  const [incidentNotes, setIncidentNotes] = useState('');

  useEffect(() => {
    if (!selectedEvent) return;

    setTitle(`${selectedEvent.title} investigation`);
    setSeverity(selectedEvent.severity || 'high');
  }, [selectedEvent]);

  useEffect(() => {
    const incident = incidents.find((item) => item.id === selectedIncidentId);
    if (!incident) return;

    setIncidentStatus(incident.status);
    setIncidentSeverity(incident.severity);
    setIncidentNotes(incident.notes ?? '');
  }, [incidents, selectedIncidentId]);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Create Incident</h3>
        <p className="mt-2 text-xs text-muted-foreground">Create a tracked investigation from the currently selected event.</p>
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Incident title"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            {['low', 'medium', 'high', 'critical'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Initial investigation notes"
            className="min-h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <button
            disabled={!selectedEvent || !title.trim() || isSaving}
            onClick={() => {
              if (!selectedEvent) return;
              onCreate({
                title: title.trim(),
                severity,
                summary: selectedEvent.summary,
                notes: notes.trim() || undefined,
                event_ids: [selectedEvent.id],
              });
            }}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create from selected event
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Update Incident</h3>
        <p className="mt-2 text-xs text-muted-foreground">Adjust status, severity, or notes for an existing case.</p>
        <div className="mt-4 space-y-3">
          <select
            value={selectedIncidentId}
            onChange={(event) => setSelectedIncidentId(event.target.value ? Number(event.target.value) : '')}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select incident</option>
            {incidents.map((incident) => (
              <option key={incident.id} value={incident.id}>{incident.title}</option>
            ))}
          </select>
          <select
            value={incidentStatus}
            onChange={(event) => setIncidentStatus(event.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            {['open', 'investigating', 'contained', 'resolved', 'closed'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={incidentSeverity}
            onChange={(event) => setIncidentSeverity(event.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            {['low', 'medium', 'high', 'critical'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <textarea
            value={incidentNotes}
            onChange={(event) => setIncidentNotes(event.target.value)}
            placeholder="Resolution or case notes"
            className="min-h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          />
          <button
            disabled={!selectedIncidentId || isSaving}
            onClick={() => {
              if (!selectedIncidentId) return;
              onUpdate(selectedIncidentId, {
                status: incidentStatus,
                severity: incidentSeverity,
                notes: incidentNotes.trim() || undefined,
              });
            }}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save incident changes
          </button>
        </div>
      </div>
    </div>
  );
}
