'use client';

import type { IntegrationProviderRow } from '@/types/observability';

export function IntegrationsPanel({
  summary,
  providers,
}: {
  summary?: Record<string, number>;
  providers: IntegrationProviderRow[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Webhook events</p>
          <p className="mt-2 text-2xl font-semibold">{summary?.webhook_events ?? 0}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Providers</p>
          <p className="mt-2 text-2xl font-semibold">{summary?.providers ?? 0}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Signature failures</p>
          <p className="mt-2 text-2xl font-semibold">{summary?.signature_failures ?? 0}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Replays</p>
          <p className="mt-2 text-2xl font-semibold">{summary?.replays ?? 0}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Failures</th>
                <th className="px-4 py-3">Replays</th>
                <th className="px-4 py-3">Success</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {providers.map((provider) => (
                <tr key={provider.provider}>
                  <td className="px-4 py-3">
                    <p className="font-medium capitalize">{provider.provider}</p>
                    <p className="text-xs text-muted-foreground">{provider.last_seen_at ? new Date(provider.last_seen_at).toLocaleString() : 'No recent callbacks'}</p>
                  </td>
                  <td className="px-4 py-3">{provider.total_events}</td>
                  <td className="px-4 py-3">
                    {provider.signature_failures + provider.missing_references + provider.payment_not_found}
                  </td>
                  <td className="px-4 py-3">{provider.replays}</td>
                  <td className="px-4 py-3">{provider.successful_callbacks}</td>
                  <td className="px-4 py-3">{provider.max_risk_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
