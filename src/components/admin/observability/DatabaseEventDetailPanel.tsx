'use client';

import type { ObservabilityEventDetail } from '@/types/observability';
import { EventTable } from '@/components/admin/observability/EventTable';
import { RawEvidencePanel } from '@/components/admin/observability/RawEvidencePanel';

interface DatabaseEventDetailPanelProps {
  detail?: ObservabilityEventDetail | null;
  onPivotIp?: (ip: string) => void;
  onPivotSession?: (sessionId: string) => void;
  onPivotPayment?: (paymentReference: string) => void;
  title?: string;
  emptyText?: string;
}

export function DatabaseEventDetailPanel({
  detail,
  onPivotIp,
  onPivotSession,
  onPivotPayment,
  title = 'Database Event Detail',
  emptyText = 'Select an event to inspect related activity and pivot into the linked attacker, session, or payment flow.',
}: DatabaseEventDetailPanelProps) {
  if (!detail) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-2 text-lg font-semibold">{detail.event.title}</p>
        <p className="text-xs text-muted-foreground">{detail.event.summary}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {detail.pivot_targets.attacker ? (
          <button
            type="button"
            onClick={() => onPivotIp?.(detail.pivot_targets.attacker as string)}
            className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-foreground/20"
          >
            Open attacker view
          </button>
        ) : null}
        {detail.pivot_targets.session_id ? (
          <button
            type="button"
            onClick={() => onPivotSession?.(detail.pivot_targets.session_id as string)}
            className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-foreground/20"
          >
            Open auth session view
          </button>
        ) : null}
        {detail.pivot_targets.payment_reference ? (
          <button
            type="button"
            onClick={() => onPivotPayment?.(detail.pivot_targets.payment_reference as string)}
            className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-foreground/20"
          >
            Open payment risk view
          </button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <EventTable events={detail.related_events} />
        <RawEvidencePanel data={{ event: detail.event, entities: detail.entities, raw: detail.raw }} />
      </div>
    </div>
  );
}
