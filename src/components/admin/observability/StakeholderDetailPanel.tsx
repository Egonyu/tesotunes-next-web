'use client';

import type { ObservabilityEvent, StakeholderDetail } from '@/types/observability';
import { EventTable } from '@/components/admin/observability/EventTable';
import { RawEvidencePanel } from '@/components/admin/observability/RawEvidencePanel';

interface StakeholderDetailPanelProps {
  detail?: StakeholderDetail | null;
  onSelectEvent?: (event: ObservabilityEvent) => void;
  onPivotIp?: (ip: string) => void;
  onPivotSession?: (sessionId: string) => void;
  onPivotPayment?: (paymentReference: string) => void;
}

export function StakeholderDetailPanel({
  detail,
  onSelectEvent,
  onPivotIp,
  onPivotSession,
  onPivotPayment,
}: StakeholderDetailPanelProps) {
  if (!detail) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Stakeholder Detail</h3>
        <p className="mt-3 text-sm text-muted-foreground">Select a stakeholder risk row to inspect identity context and linked security events.</p>
      </div>
    );
  }

  const primaryIp = detail.summary.source_ips[0];
  const sessionId = detail.events.find((event) => event.correlation.session_id)?.correlation.session_id ?? null;
  const paymentReference = detail.events.find((event) => typeof event.details.payment_reference === 'string')?.details.payment_reference as string | undefined;

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">Stakeholder Detail</h3>
        <p className="mt-2 text-lg font-semibold">{detail.actor.label}</p>
        <p className="text-xs text-muted-foreground">{detail.actor.actor_type} {detail.actor.email ? `• ${detail.actor.email}` : ''}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Risk</p>
          <p className="mt-1 text-lg font-semibold">{detail.actor.risk_score}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Events</p>
          <p className="mt-1 text-lg font-semibold">{detail.actor.total_events}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Payment Touches</p>
          <p className="mt-1 text-lg font-semibold">{detail.actor.payment_events}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Last Seen</p>
          <p className="mt-1 text-sm font-semibold">{detail.summary.last_seen_at ? new Date(detail.summary.last_seen_at).toLocaleString() : 'Unknown'}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {primaryIp ? (
          <button
            type="button"
            onClick={() => onPivotIp?.(primaryIp)}
            className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-foreground/20"
          >
            Open attacker view
          </button>
        ) : null}
        {sessionId ? (
          <button
            type="button"
            onClick={() => onPivotSession?.(sessionId)}
            className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-foreground/20"
          >
            Open auth session view
          </button>
        ) : null}
        {paymentReference ? (
          <button
            type="button"
            onClick={() => onPivotPayment?.(paymentReference)}
            className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-foreground/20"
          >
            Open payment risk view
          </button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <EventTable events={detail.events} onSelect={onSelectEvent} />
        <RawEvidencePanel data={{
          actor: detail.actor,
          source_ips: detail.summary.source_ips,
          domains: detail.summary.domains,
          outcomes: detail.summary.outcomes,
        }} />
      </div>
    </div>
  );
}
