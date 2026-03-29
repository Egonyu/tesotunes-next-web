'use client';

import type { AttackerDetail, AttackerRow } from '@/types/observability';
import { EventTable } from '@/components/admin/observability/EventTable';

interface AttackerDrawerProps {
  attacker: AttackerRow | null;
  detail?: AttackerDetail | null;
}

export function AttackerDrawer({ attacker, detail }: AttackerDrawerProps) {
  if (!attacker) return null;

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Attacker Profile</h3>
      <p className="mt-3 text-lg font-semibold">{attacker.label}</p>
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <p>Attempts: {attacker.attempts}</p>
        <p>Successful: {attacker.successful}</p>
        <p>Blocked: {attacker.blocked}</p>
        <p>Risk: {attacker.risk_score}</p>
        <p>First seen: {attacker.first_seen ? new Date(attacker.first_seen).toLocaleString() : 'Unknown'}</p>
        <p>Last seen: {attacker.last_seen ? new Date(attacker.last_seen).toLocaleString() : 'Unknown'}</p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{attacker.routes.join(', ') || 'No routes captured yet.'}</p>

      {detail ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Recent linked events</p>
          <EventTable events={detail.events.slice(0, 8)} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Loading attacker detail...</p>
      )}
    </div>
  );
}
