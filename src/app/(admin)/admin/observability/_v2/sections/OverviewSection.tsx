'use client';

import { useMemo } from 'react';
import { useObservabilityStore } from '@/stores';
import {
  useObservabilityOverview,
  usePosture,
  useIncidents,
  useStakeholderRisk,
  useSystemHost,
} from '@/lib/observability';
import type {
  CollectorHostRow,
  IncidentRow,
  StakeholderRiskRow,
} from '@/types/observability';
import {
  CollectorDot,
  EmptyState,
  RankedTable,
  SectionHeader,
  SkeletonPanel,
  StatCard,
  StatRow,
} from '@/components/admin/observability/primitives';
import type {
  CollectorState,
  RankedColumn,
  StatThreshold,
} from '@/components/admin/observability/primitives';
import { useDetailSlideOver } from '../DetailSlideOverContext';

type ThresholdScale = 'incidents' | 'system' | 'auth' | 'collector';

function pickThreshold(value: number | undefined, scale: ThresholdScale): StatThreshold {
  if (value === undefined || value === 0) return 'muted';
  if (scale === 'incidents') return value >= 5 ? 'crit' : 'warn';
  if (scale === 'system') return value >= 1 ? 'crit' : 'muted';
  if (scale === 'auth') return value >= 25 ? 'crit' : value >= 5 ? 'warn' : 'muted';
  if (scale === 'collector') return value >= 3 ? 'crit' : 'warn';
  return 'muted';
}

function collectorStateFrom(row: CollectorHostRow): CollectorState {
  // Server now derives `state` (see rebuild plan §4 item 5). Fall back to the old
  // client-side mapping when older API responses are still in flight.
  if (row.state === 'ok' || row.state === 'stale' || row.state === 'down') return row.state;
  if (row.status === 'healthy') return 'ok';
  if (row.status === 'stale') return 'stale';
  if (row.max_severity && ['critical', 'high'].includes(row.max_severity)) return 'down';
  return 'unknown';
}

export function OverviewSection() {
  const filters = useObservabilityStore((s) => s.filters);
  const { open: openDetail } = useDetailSlideOver();

  // `usePosture` returns just the four KPIs the header renders (rebuild plan §4 item 2).
  // The heavier `useObservabilityOverview` stays around for the `recent_events` /
  // `top_attacked_endpoints` blocks still consumed elsewhere, but we no longer depend on
  // it for the headline row.
  const postureQuery = usePosture(filters);
  const overviewQuery = useObservabilityOverview(filters, { enabled: false });
  void overviewQuery;
  const incidentsQuery = useIncidents(filters, true);
  const stakeholderQuery = useStakeholderRisk(filters, true);
  const systemHostQuery = useSystemHost(filters, true);

  const summary = postureQuery.data?.summary;
  const collectorHosts = systemHostQuery.data?.collector?.hosts ?? [];
  const incidents: IncidentRow[] = incidentsQuery.data ?? [];

  const openIncidents = useMemo(
    () => incidents.filter((incident) => incident.status !== 'resolved' && incident.status !== 'closed'),
    [incidents],
  );

  const stakeholderColumns: RankedColumn<StakeholderRiskRow>[] = useMemo(
    () => [
      {
        key: 'actor',
        header: 'Actor',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.label || row.actor_id}</span>
            <span className="text-xs text-muted-foreground">
              {row.actor_type}
              {row.email ? ' \u00b7 ' + row.email : ''}
            </span>
          </div>
        ),
      },
      {
        key: 'risk',
        header: 'Risk',
        align: 'right',
        width: '88px',
        render: (row) => {
          const cls =
            row.risk_score >= 75
              ? 'font-semibold text-rose-600 dark:text-rose-300'
              : row.risk_score >= 40
                ? 'font-semibold text-amber-600 dark:text-amber-300'
                : 'text-foreground';
          return <span className={cls}>{row.risk_score}</span>;
        },
      },
      {
        key: 'events',
        header: 'Events',
        align: 'right',
        width: '80px',
        render: (row) => row.total_events,
      },
      {
        key: 'suspicious',
        header: 'Suspicious',
        align: 'right',
        width: '110px',
        render: (row) => row.successful_suspicious_events,
      },
    ],
    [],
  );

  const incidentColumns: RankedColumn<IncidentRow>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Incident',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.title}</span>
            <span className="text-xs text-muted-foreground">
              {row.severity}
              {row.detected_at ? ' \u00b7 ' + new Date(row.detected_at).toLocaleString() : ''}
            </span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        align: 'right',
        width: '110px',
        render: (row) => (
          <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
            {row.status}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Overview"
        description="Health at a glance \u2014 anything red here needs attention right now."
      />

      <StatRow columns={4}>
        <StatCard
          label="Unresolved incidents"
          value={summary?.unresolved_incidents ?? (postureQuery.isLoading ? undefined : 0)}
          threshold={pickThreshold(summary?.unresolved_incidents, 'incidents')}
          hint={openIncidents.length > 0 ? openIncidents.length + ' open' : undefined}
          isLoading={postureQuery.isLoading && !summary}
        />
        <StatCard
          label="Stale collectors"
          value={summary?.collector_stale_sources ?? (postureQuery.isLoading ? undefined : 0)}
          threshold={pickThreshold(summary?.collector_stale_sources, 'collector')}
          hint={
            systemHostQuery.data
              ? systemHostQuery.data.collector.summary.healthy_sources + ' healthy'
              : undefined
          }
          isLoading={postureQuery.isLoading && !summary}
        />
        <StatCard
          label="DB auth failures"
          value={summary?.db_auth_failures ?? (postureQuery.isLoading ? undefined : 0)}
          threshold={pickThreshold(summary?.db_auth_failures, 'auth')}
          isLoading={postureQuery.isLoading && !summary}
        />
        <StatCard
          label="Critical host signals"
          value={summary?.critical_system_signals ?? (postureQuery.isLoading ? undefined : 0)}
          threshold={pickThreshold(summary?.critical_system_signals, 'system')}
          isLoading={postureQuery.isLoading && !summary}
        />
      </StatRow>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Open incidents</h3>
          <RankedTable
            rows={openIncidents}
            columns={incidentColumns}
            getRowId={(row) => row.id}
            isLoading={incidentsQuery.isLoading}
            isError={incidentsQuery.isError}
            emptyMessage="No open incidents."
            onRowClick={(row) =>
              openDetail({ kind: 'incident', id: String(row.id), label: row.title, seed: row })
            }
            compact
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Collector health</h3>
          {systemHostQuery.isLoading && !systemHostQuery.data ? (
            <SkeletonPanel rows={3} />
          ) : collectorHosts.length === 0 ? (
            <EmptyState title="No collector hosts reporting" />
          ) : (
            <ul className="grid gap-2 rounded-2xl border bg-card p-3 shadow-sm sm:grid-cols-2">
              {collectorHosts.slice(0, 8).map((row) => (
                <li
                  key={row.host}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{row.host}</p>
                    <p className="truncate text-muted-foreground">
                      {row.events} events \u00b7 risk {row.max_risk_score}
                    </p>
                  </div>
                  <CollectorDot state={collectorStateFrom(row)} label={row.status} pulse />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Top stakeholders at risk</h3>
        <RankedTable
          rows={stakeholderQuery.data?.actors ?? []}
          columns={stakeholderColumns}
          getRowId={(row) => row.actor_type + ':' + row.actor_id}
          isLoading={stakeholderQuery.isLoading}
          isError={stakeholderQuery.isError}
          onRowClick={(row) =>
            openDetail({
              kind: 'stakeholder',
              id: row.actor_type + ':' + row.actor_id,
              label: row.label || row.actor_id,
              seed: row,
            })
          }
          emptyMessage="No stakeholder signals in this window."
        />
      </div>
    </div>
  );
}
sk</h3>
        <RankedTable
          rows={stakeholderQuery.data?.actors ?? []}
          columns={stakeholderColumns}
          getRowId={(row) => row.actor_type + ':' + row.actor_id}
          isLoading={stakeholderQuery.isLoading}
          isError={stakeholderQuery.isError}
          onRowClick={(row) =>
            openDetail({
              kind: 'stakeholder',
              id: row.actor_type + ':' + row.actor_id,
              label: row.label || row.actor_id,
              seed: row,
            })
          }
          emptyMessage="No stakeholder signals in this window."
        />
      </div>
    </div>
  );
}
