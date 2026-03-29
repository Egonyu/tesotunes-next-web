'use client';

import type { ObservabilityEvent, SessionDetail } from '@/types/observability';
import { EventTable } from '@/components/admin/observability/EventTable';
import { RawEvidencePanel } from '@/components/admin/observability/RawEvidencePanel';

interface SessionDetailPanelProps {
  detail?: SessionDetail | null;
  onSelectEvent?: (event: ObservabilityEvent) => void;
}

export function SessionDetailPanel({ detail, onSelectEvent }: SessionDetailPanelProps) {
  if (!detail) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Session Detail</h3>
        <p className="mt-3 text-sm text-muted-foreground">Select or pivot into a session to inspect linked auth activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">Session Detail</h3>
        <p className="mt-2 text-lg font-semibold">{detail.session.session_id}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Events</p>
          <p className="mt-1 text-lg font-semibold">{detail.session.event_count}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Max Risk</p>
          <p className="mt-1 text-lg font-semibold">{detail.session.max_risk_score}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Last Seen</p>
          <p className="mt-1 text-sm font-semibold">{detail.session.last_seen_at ? new Date(detail.session.last_seen_at).toLocaleString() : 'Unknown'}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <EventTable events={detail.events} onSelect={onSelectEvent} />
        <RawEvidencePanel data={{
          source_ips: detail.session.source_ips,
          actors: detail.session.actors,
          outcomes: detail.session.outcomes,
          first_seen_at: detail.session.first_seen_at,
          last_seen_at: detail.session.last_seen_at,
        }} />
      </div>
    </div>
  );
}
