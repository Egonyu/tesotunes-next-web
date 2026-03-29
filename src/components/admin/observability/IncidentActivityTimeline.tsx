'use client';

import type { IncidentActivityEntry } from '@/types/observability';

function formatActivityLabel(entry: IncidentActivityEntry) {
  const attachedCount = Array.isArray(entry.context.attached_event_ids) ? entry.context.attached_event_ids.length : 0;
  const detachedCount = Array.isArray(entry.context.detached_event_ids) ? entry.context.detached_event_ids.length : 0;

  if (entry.action === 'assigned') {
    return `Assigned to ${entry.context.owner_name ?? entry.performed_by?.name ?? 'current responder'}`;
  }

  if (entry.action === 'released') {
    return 'Released incident ownership';
  }

  if (entry.action === 'created') {
    const count = Array.isArray(entry.context.event_ids) ? entry.context.event_ids.length : 0;
    return count > 0 ? `Incident created with ${count} linked event${count === 1 ? '' : 's'}` : 'Incident created';
  }

  if (entry.action === 'updated') {
    if (attachedCount > 0 || detachedCount > 0) {
      if (attachedCount > 0 && detachedCount > 0) {
        return `Updated event links (+${attachedCount} / -${detachedCount})`;
      }

      if (attachedCount > 0) {
        return `Attached ${attachedCount} event${attachedCount === 1 ? '' : 's'}`;
      }

      return `Detached ${detachedCount} event${detachedCount === 1 ? '' : 's'}`;
    }

    const changes = entry.context.changes && typeof entry.context.changes === 'object'
      ? Object.keys(entry.context.changes as Record<string, unknown>)
      : [];

    if (changes.length > 0) {
      return `Updated ${changes.join(', ')}`;
    }

    if (entry.context.note_appended) {
      return 'Appended case note';
    }

    const count = Array.isArray(entry.context.event_ids) ? entry.context.event_ids.length : 0;
    return count > 0 ? `Updated linked events (${count})` : 'Incident updated';
  }

  return entry.action;
}

export function IncidentActivityTimeline({ activity }: { activity: IncidentActivityEntry[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Case Activity</h3>
      <div className="mt-4 space-y-3">
        {activity.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No case activity recorded yet.
          </div>
        ) : activity
          .slice()
          .reverse()
          .map((entry, index) => (
            <div key={`${entry.action}-${entry.performed_at}-${index}`} className="rounded-xl border px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{formatActivityLabel(entry)}</p>
                  {entry.performed_by?.name ? (
                    <p className="mt-1 text-xs text-muted-foreground">By {entry.performed_by.name}</p>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {entry.performed_at ? new Date(entry.performed_at).toLocaleString() : 'Unknown time'}
                </p>
              </div>

              {entry.action === 'updated' && entry.context.changes && typeof entry.context.changes === 'object' ? (
                <div className="mt-3 space-y-2">
                  {Object.entries(entry.context.changes as Record<string, { from?: unknown; to?: unknown }>).map(([field, change]) => (
                    <div key={field} className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{field}</span>
                      {': '}
                      {String(change.from ?? 'empty')}
                      {' -> '}
                      {String(change.to ?? 'empty')}
                    </div>
                  ))}
                </div>
              ) : null}

              {entry.action === 'updated' && entry.context.note_appended ? (
                <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  Added a new case note entry.
                </div>
              ) : null}
            </div>
          ))}
      </div>
    </div>
  );
}
