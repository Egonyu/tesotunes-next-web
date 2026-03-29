'use client';

import type { ObservabilityEvent, PaymentRiskDetail } from '@/types/observability';
import { EventTable } from '@/components/admin/observability/EventTable';
import { RawEvidencePanel } from '@/components/admin/observability/RawEvidencePanel';

interface PaymentRiskDetailPanelProps {
  detail?: PaymentRiskDetail | null;
  onSelectEvent?: (event: ObservabilityEvent) => void;
}

export function PaymentRiskDetailPanel({ detail, onSelectEvent }: PaymentRiskDetailPanelProps) {
  if (!detail) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Payment Detail</h3>
        <p className="mt-3 text-sm text-muted-foreground">Select or pivot into a payment reference to inspect linked issues, timeline, and risk events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">Payment Detail</h3>
        <p className="mt-2 text-lg font-semibold">{detail.payment_reference}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Risk Events</p>
          <p className="mt-1 text-lg font-semibold">{detail.summary.event_count}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Max Risk</p>
          <p className="mt-1 text-lg font-semibold">{detail.summary.max_risk_score}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground">Last Seen</p>
          <p className="mt-1 text-sm font-semibold">{detail.summary.last_seen_at ? new Date(detail.summary.last_seen_at).toLocaleString() : 'Unknown'}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <EventTable events={detail.events} onSelect={onSelectEvent} />
        <RawEvidencePanel data={{
          payment: detail.payment,
          issues: detail.issues,
          timeline: detail.timeline,
          source_ips: detail.summary.source_ips,
          outcomes: detail.summary.outcomes,
        }} />
      </div>
    </div>
  );
}
