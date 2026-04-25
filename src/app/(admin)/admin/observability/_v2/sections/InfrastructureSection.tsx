'use client';

import { useMemo } from 'react';
import { useObservabilityStore } from '@/stores';
import {
  useSystemHost,
  useDatabase,
  useChanges,
} from '@/lib/observability';
import type {
  CollectorHostRow,
  DatabaseCollectorBreakdownRow,
  ObservabilityEvent,
} from '@/types/observability';
import {
  CollectorDot,
  EmptyState,
  RankedTable,
  SectionHeader,
  StatCard,
  StatRow,
} from '@/components/admin/observability/primitives';
import type {
  CollectorState,
  RankedColumn,
  SectionSubTab,
} from '@/components/admin/observability/primitives';
import { useObservabilityShellStore } from '../shellStore';
import { useDetailSlideOver } from '../DetailSlideOverContext';

const SUB_TABS: SectionSubTab[] = [
  { key: 'collectors', label: 'Collectors' },
  { key: 'database', label: 'Database' },
  { key: 'hosts', label: 'Hosts' },
  { key: 'integrity', label: 'Changes / integrity' },
];

function collectorStateFrom(row: CollectorHostRow): CollectorState {
  if (row.status === 'healthy') return 'ok';
  if (row.status === 'stale') return 'stale';
  if (row.max_severity && ['critical', 'high'].includes(row.max_severity)) return 'down';
  return 'unknown';
}

function eventColumns(): RankedColumn<ObservabilityEvent>[] {
  return [
    {
      key: 'when',
      header: 'When',
      width: '170px',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.occurred_at ? new Date(row.occurred_at).toLocaleString() : '\u2014'}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Event',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.title}</span>
          <span className="text-xs text-muted-foreground">
            {row.domain} \u00b7 {row.category}
          </span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.severity ?? '\u2014'}</span>
      ),
    },
    {
      key: 'risk',
      header: 'Risk',
      align: 'right',
      width: '72px',
      render: (row) => row.risk.score,
    },
  ];
}

export function InfrastructureSection() {
  const filters = useObservabilityStore((s) => s.filters);
  const activeSubTab = useObservabilityShellStore((s) => s.activeSubTab) ?? 'collectors';
  const setSubTab = useObservabilityShellStore((s) => s.setSubTab);
  const { open: openDetail } = useDetailSlideOver();

  const systemHostQuery = useSystemHost(
    filters,
    activeSubTab === 'collectors' || activeSubTab === 'hosts',
  );
  const databaseQuery = useDatabase(filters, activeSubTab === 'database');
  const changesQuery = useChanges(filters, activeSubTab === 'integrity');

  const collectorHosts = systemHostQuery.data?.collector.hosts ?? [];
  const collectorSummary = systemHostQuery.data?.collector.summary;

  const hostColumns: RankedColumn<CollectorHostRow>[] = useMemo(
    () => [
      {
        key: 'status',
        header: '',
        width: '40px',
        render: (row) => <CollectorDot state={collectorStateFrom(row)} pulse />,
      },
      {
        key: 'host',
        header: 'Host',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.host}</span>
            <span className="text-xs text-muted-foreground">
              {row.domains.slice(0, 3).join(', ') || 'no domains'}
            </span>
          </div>
        ),
      },
      {
        key: 'events',
        header: 'Events',
        align: 'right',
        width: '90px',
        render: (row) => row.events,
      },
      {
        key: 'severity',
        header: 'Max sev',
        width: '100px',
        render: (row) => (
          <span className="text-xs text-muted-foreground">{row.max_severity ?? '\u2014'}</span>
        ),
      },
      {
        key: 'risk',
        header: 'Max risk',
        align: 'right',
        width: '90px',
        render: (row) => row.max_risk_score,
      },
      {
        key: 'last_seen',
        header: 'Last seen',
        width: '160px',
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : '\u2014'}
          </span>
        ),
      },
    ],
    [],
  );

  const dbBreakdownColumns: RankedColumn<DatabaseCollectorBreakdownRow>[] = useMemo(
    () => [
      {
        key: 'type',
        header: 'Signal type',
        render: (row) => <span className="font-medium">{row.type}</span>,
      },
      {
        key: 'events',
        header: 'Events',
        align: 'right',
        width: '100px',
        render: (row) => row.events,
      },
      {
        key: 'risk',
        header: 'Max risk',
        align: 'right',
        width: '100px',
        render: (row) => row.max_risk_score,
      },
      {
        key: 'last_seen',
        header: 'Last seen',
        width: '180px',
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : '\u2014'}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Infrastructure"
        description="Collector health, database signals, host rollups, and integrity snapshots."
        subTabs={SUB_TABS}
        activeSubTab={activeSubTab}
        onSubTabChange={setSubTab}
      />

      {activeSubTab === 'collectors' ? (
        <div className="space-y-6">
          <StatRow columns={4}>
            <StatCard
              label="Collector events"
              value={collectorSummary?.events ?? (systemHostQuery.isLoading ? undefined : 0)}
              threshold="muted"
              isLoading={systemHostQuery.isLoading && !systemHostQuery.data}
            />
            <StatCard
              label="Healthy sources"
              value={collectorSummary?.healthy_sources ?? (systemHostQuery.isLoading ? undefined : 0)}
              threshold="ok"
              isLoading={systemHostQuery.isLoading && !systemHostQuery.data}
            />
            <StatCard
              label="Stale sources"
              value={collectorSummary?.stale_sources ?? (systemHostQuery.isLoading ? undefined : 0)}
              threshold={
                (collectorSummary?.stale_sources ?? 0) >= 3
                  ? 'crit'
                  : (collectorSummary?.stale_sources ?? 0) > 0
                    ? 'warn'
                    : 'muted'
              }
              isLoading={systemHostQuery.isLoading && !systemHostQuery.data}
            />
            <StatCard
              label="Telemetry gaps"
              value={collectorSummary?.telemetry_gaps ?? (systemHostQuery.isLoading ? undefined : 0)}
              threshold={(collectorSummary?.telemetry_gaps ?? 0) > 0 ? 'warn' : 'muted'}
              isLoading={systemHostQuery.isLoading && !systemHostQuery.data}
            />
          </StatRow>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Priority alerts</h3>
            <RankedTable
              rows={systemHostQuery.data?.collector.priority_alerts ?? []}
              columns={eventColumns()}
              getRowId={(row) => row.id}
              isLoading={systemHostQuery.isLoading}
              isError={systemHostQuery.isError}
              onRowClick={(row) =>
                openDetail({ kind: 'system-event', id: String(row.id), label: row.title, seed: row })
              }
              emptyMessage="No collector priority alerts."
              compact
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recent collector events</h3>
            <RankedTable
              rows={systemHostQuery.data?.collector.recent ?? []}
              columns={eventColumns()}
              getRowId={(row) => row.id}
              isLoading={systemHostQuery.isLoading}
              isError={systemHostQuery.isError}
              onRowClick={(row) =>
                openDetail({ kind: 'system-event', id: String(row.id), label: row.title, seed: row })
              }
              emptyMessage="No recent collector events."
              compact
            />
          </div>
        </div>
      ) : null}

      {activeSubTab === 'hosts' ? (
        <div className="space-y-6">
          {collectorHosts.length === 0 && !systemHostQuery.isLoading ? (
            <EmptyState
              title="No collector hosts reporting"
              description="Hosts will appear here once collectors begin sending telemetry."
            />
          ) : (
            <RankedTable
              rows={collectorHosts}
              columns={hostColumns}
              getRowId={(row) => row.host}
              isLoading={systemHostQuery.isLoading}
              isError={systemHostQuery.isError}
              emptyMessage="No hosts reporting."
            />
          )}
        </div>
      ) : null}

      {activeSubTab === 'database' ? (
        <div className="space-y-6">
          <StatRow columns={3}>
            <StatCard
              label="DB events"
              value={
                databaseQuery.data
                  ? Object.values(databaseQuery.data.summary).reduce(
                      (sum, v) => sum + (typeof v === 'number' ? v : 0),
                      0,
                    )
                  : databaseQuery.isLoading
                    ? undefined
                    : 0
              }
              threshold="muted"
              isLoading={databaseQuery.isLoading && !databaseQuery.data}
            />
            <StatCard
              label="Priority alerts"
              value={databaseQuery.data?.priority_alerts.length ?? (databaseQuery.isLoading ? undefined : 0)}
              threshold={(databaseQuery.data?.priority_alerts.length ?? 0) > 0 ? 'crit' : 'muted'}
              isLoading={databaseQuery.isLoading && !databaseQuery.data}
            />
            <StatCard
              label="Slow queries"
              value={databaseQuery.data?.slow_queries.length ?? (databaseQuery.isLoading ? undefined : 0)}
              threshold={(databaseQuery.data?.slow_queries.length ?? 0) > 0 ? 'warn' : 'muted'}
              isLoading={databaseQuery.isLoading && !databaseQuery.data}
            />
          </StatRow>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Signal breakdown</h3>
            <RankedTable
              rows={databaseQuery.data?.collector_breakdown ?? []}
              columns={dbBreakdownColumns}
              getRowId={(row) => row.type}
              isLoading={databaseQuery.isLoading}
              isError={databaseQuery.isError}
              emptyMessage="No database signals in this window."
              compact
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Priority alerts</h3>
            <RankedTable
              rows={databaseQuery.data?.priority_alerts ?? []}
              columns={eventColumns()}
              getRowId={(row) => row.id}
              isLoading={databaseQuery.isLoading}
              isError={databaseQuery.isError}
              onRowClick={(row) =>
                openDetail({ kind: 'database-event', id: String(row.id), label: row.title, seed: row })
              }
              emptyMessage="No priority database alerts."
              compact
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recent events</h3>
            <RankedTable
              rows={databaseQuery.data?.recent ?? []}
              columns={eventColumns()}
              getRowId={(row) => row.id}
              isLoading={databaseQuery.isLoading}
              isError={databaseQuery.isError}
              onRowClick={(row) =>
                openDetail({ kind: 'database-event', id: String(row.id), label: row.title, seed: row })
              }
              emptyMessage="No recent database events."
              compact
            />
          </div>
        </div>
      ) : null}

      {activeSubTab === 'integrity' ? (
        <div className="space-y-6">
          <StatRow columns={2}>
            <StatCard
              label="Change events"
              value={changesQuery.data?.recent.length ?? (changesQuery.isLoading ? undefined : 0)}
              threshold={(changesQuery.data?.recent.length ?? 0) > 0 ? 'info' : 'muted'}
              isLoading={changesQuery.isLoading && !changesQuery.data}
            />
            <StatCard
              label="Integrity snapshots"
              value={
                changesQuery.data?.integrity_snapshots.length ??
                (changesQuery.isLoading ? undefined : 0)
              }
              threshold="muted"
              isLoading={changesQuery.isLoading && !changesQuery.data}
            />
          </StatRow>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recent changes</h3>
            <RankedTable
              rows={changesQuery.data?.recent ?? []}
              columns={eventColumns()}
              getRowId={(row) => row.id}
              isLoading={changesQuery.isLoading}
              isError={changesQuery.isError}
              onRowClick={(row) =>
                openDetail({ kind: 'change-event', id: String(row.id), label: row.title, seed: row })
              }
              emptyMessage="No change events in this window."
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
