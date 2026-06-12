'use client';

import { useSecurityIncidents, useSecurityPosture } from '@/lib/security-console/hooks';
import {
  EmptyState,
  SectionCard,
  SeverityBadge,
  SkeletonRows,
  StatCard,
  formatWhen,
  riskClass,
} from './ui';

const DOMAIN_LABEL: Record<string, string> = {
  auth: 'Auth & Identity',
  payments: 'Payments & Fraud',
  api: 'API Abuse & Bots',
  integrity: 'Integrity & Insider',
  system: 'System',
};

export function OverviewPanel() {
  const posture = useSecurityPosture();
  const incidents = useSecurityIncidents();

  const kpis = posture.data?.kpis;
  const openIncidents = (incidents.data ?? []).filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed',
  );
  const byDomain = posture.data?.by_domain ?? {};
  const domainTotal = Object.values(byDomain).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Open incidents"
          value={kpis?.open_incidents}
          tone={(kpis?.open_incidents ?? 0) > 0 ? 'crit' : 'ok'}
          isLoading={posture.isLoading}
        />
        <StatCard
          label="Critical"
          value={kpis?.critical_incidents}
          tone={(kpis?.critical_incidents ?? 0) > 0 ? 'crit' : 'muted'}
          isLoading={posture.isLoading}
        />
        <StatCard
          label="High-risk events"
          value={kpis?.high_risk_events}
          tone={(kpis?.high_risk_events ?? 0) > 0 ? 'warn' : 'muted'}
          isLoading={posture.isLoading}
        />
        <StatCard
          label="Failed logins"
          value={kpis?.failed_logins}
          tone={(kpis?.failed_logins ?? 0) >= 25 ? 'crit' : (kpis?.failed_logins ?? 0) > 0 ? 'warn' : 'muted'}
          isLoading={posture.isLoading}
        />
        <StatCard
          label="Webhook failures"
          value={kpis?.webhook_failures}
          tone={(kpis?.webhook_failures ?? 0) > 0 ? 'crit' : 'muted'}
          isLoading={posture.isLoading}
        />
        <StatCard
          label="Blocked API hits"
          value={kpis?.blocked_api}
          tone={(kpis?.blocked_api ?? 0) > 0 ? 'warn' : 'muted'}
          isLoading={posture.isLoading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <SectionCard
          title="Open incidents"
          description="Anything here is an active, correlated threat."
        >
          {incidents.isLoading ? (
            <SkeletonRows rows={3} />
          ) : openIncidents.length === 0 ? (
            <EmptyState
              title="No open incidents"
              description="The detection engine has not correlated any active threats."
            />
          ) : (
            <ul className="divide-y">
              {openIncidents.slice(0, 6).map((incident) => (
                <li key={incident.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{incident.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {incident.event_count} events · detected {formatWhen(incident.detected_at)}
                    </p>
                  </div>
                  <SeverityBadge severity={incident.severity} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Events by domain" description="Distribution across security domains.">
          {posture.isLoading ? (
            <SkeletonRows rows={4} />
          ) : domainTotal === 0 ? (
            <EmptyState title="No events in window" />
          ) : (
            <ul className="space-y-3">
              {Object.entries(byDomain)
                .sort((a, b) => b[1] - a[1])
                .map(([domain, count]) => (
                  <li key={domain}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{DOMAIN_LABEL[domain] ?? domain}</span>
                      <span className="tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((count / domainTotal) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Top risk entities"
        description="Highest-scoring actors and source IPs across the platform."
      >
        {posture.isLoading ? (
          <SkeletonRows rows={3} />
        ) : (posture.data?.top_risk_entities ?? []).length === 0 ? (
          <EmptyState title="No elevated-risk entities" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Entity</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 text-right font-medium">Risk</th>
                <th className="pb-2 text-right font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(posture.data?.top_risk_entities ?? []).map((entity) => (
                <tr key={entity.entity_key}>
                  <td className="py-2 font-medium">{entity.label}</td>
                  <td className="py-2 text-muted-foreground">{entity.entity_type}</td>
                  <td className={`py-2 text-right tabular-nums ${riskClass(entity.risk_score)}`}>
                    {entity.risk_score}
                  </td>
                  <td className="py-2 text-right text-xs text-muted-foreground">
                    {formatWhen(entity.last_seen_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
