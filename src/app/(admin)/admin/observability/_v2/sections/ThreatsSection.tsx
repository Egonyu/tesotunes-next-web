'use client';

import { useMemo } from 'react';
import { useObservabilityStore } from '@/stores';
import {
  useThreatEvents,
  useEntryPoints,
  useAttackers,
  useBots,
} from '@/lib/observability';
import type {
  AttackerRow,
  EntryPointRow,
  ObservabilityEvent,
} from '@/types/observability';
import {
  EmptyState,
  RankedTable,
  SectionHeader,
  StatCard,
  StatRow,
} from '@/components/admin/observability/primitives';
import type {
  RankedColumn,
  SectionSubTab,
} from '@/components/admin/observability/primitives';
import { useObservabilityShellStore } from '../shellStore';
import { useDetailSlideOver } from '../DetailSlideOverContext';

const SUB_TABS: SectionSubTab[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'entry-points', label: 'Entry points' },
  { key: 'attackers', label: 'Attackers' },
  { key: 'bots', label: 'Bots' },
];

function severityToClass(severity: string | null | undefined) {
  switch (severity) {
    case 'critical':
      return 'text-rose-600 dark:text-rose-300';
    case 'high':
      return 'text-amber-600 dark:text-amber-300';
    case 'medium':
      return 'text-sky-600 dark:text-sky-300';
    default:
      return 'text-muted-foreground';
  }
}

export function ThreatsSection() {
  const filters = useObservabilityStore((s) => s.filters);
  const activeSubTab = useObservabilityShellStore((s) => s.activeSubTab) ?? 'timeline';
  const setSubTab = useObservabilityShellStore((s) => s.setSubTab);
  const { open: openDetail } = useDetailSlideOver();

  const threatEventsQuery = useThreatEvents(filters);
  const entryPointsQuery = useEntryPoints(filters);
  const attackersQuery = useAttackers(filters);
  const botsQuery = useBots(filters, activeSubTab === 'bots');

  const eventColumns: RankedColumn<ObservabilityEvent>[] = useMemo(
    () => [
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
        render: (row) => <span className={severityToClass(row.severity)}>{row.severity}</span>,
      },
      {
        key: 'outcome',
        header: 'Outcome',
        width: '110px',
        render: (row) => (
          <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
            {row.outcome}
          </span>
        ),
      },
      {
        key: 'risk',
        header: 'Risk',
        align: 'right',
        width: '72px',
        render: (row) => row.risk.score,
      },
    ],
    [],
  );

  const entryPointColumns: RankedColumn<EntryPointRow>[] = useMemo(
    () => [
      {
        key: 'label',
        header: 'Entry point',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.label}</span>
            <span className="text-xs text-muted-foreground">
              {row.subsystem} \u00b7 {row.route_pattern}
            </span>
          </div>
        ),
      },
      {
        key: 'exposure',
        header: 'Exposure',
        width: '130px',
        render: (row) => (
          <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
            {row.exposure_type}
          </span>
        ),
      },
      {
        key: 'criticality',
        header: 'Criticality',
        width: '120px',
        render: (row) => (
          <span className={severityToClass(row.criticality)}>{row.criticality}</span>
        ),
      },
      {
        key: 'hits',
        header: 'Hits',
        align: 'right',
        width: '80px',
        render: (row) => row.totals?.hits ?? 0,
      },
      {
        key: 'blocked',
        header: 'Blocked',
        align: 'right',
        width: '90px',
        render: (row) => row.totals?.blocked ?? 0,
      },
    ],
    [],
  );

  const attackerColumns: RankedColumn<AttackerRow>[] = useMemo(
    () => [
      {
        key: 'label',
        header: 'Attacker',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.label}</span>
            <span className="text-xs text-muted-foreground">{row.entity_type}</span>
          </div>
        ),
      },
      {
        key: 'risk',
        header: 'Risk',
        align: 'right',
        width: '80px',
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
        key: 'attempts',
        header: 'Attempts',
        align: 'right',
        width: '90px',
        render: (row) => row.attempts,
      },
      {
        key: 'successful',
        header: 'Successful',
        align: 'right',
        width: '100px',
        render: (row) => (
          <span className={row.successful > 0 ? 'font-semibold text-rose-600 dark:text-rose-300' : undefined}>
            {row.successful}
          </span>
        ),
      },
      {
        key: 'blocked',
        header: 'Blocked',
        align: 'right',
        width: '90px',
        render: (row) => row.blocked,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Threats"
        description="Events, entry points, attackers, and bot pressure."
        subTabs={SUB_TABS}
        activeSubTab={activeSubTab}
        onSubTabChange={setSubTab}
      />

      {activeSubTab === 'timeline' ? (
        <RankedTable
          rows={threatEventsQuery.data?.rows ?? []}
          columns={eventColumns}
          getRowId={(row) => row.id}
          isLoading={threatEventsQuery.isLoading}
          isError={threatEventsQuery.isError}
          onRowClick={(row) =>
            openDetail({ kind: 'event', id: String(row.id), label: row.title, seed: row })
          }
          emptyMessage="No threat events in this window."
          caption={
            threatEventsQuery.data
              ? threatEventsQuery.data.rows.length + ' of ' + threatEventsQuery.data.total + ' events'
              : undefined
          }
        />
      ) : null}

      {activeSubTab === 'entry-points' ? (
        <RankedTable
          rows={entryPointsQuery.data ?? []}
          columns={entryPointColumns}
          getRowId={(row) => row.entry_key}
          isLoading={entryPointsQuery.isLoading}
          isError={entryPointsQuery.isError}
          emptyMessage="No entry-point telemetry."
        />
      ) : null}

      {activeSubTab === 'attackers' ? (
        <RankedTable
          rows={attackersQuery.data ?? []}
          columns={attackerColumns}
          getRowId={(row) => row.id}
          isLoading={attackersQuery.isLoading}
          isError={attackersQuery.isError}
          onRowClick={(row) =>
            openDetail({ kind: 'attacker', id: String(row.id), label: row.label, seed: row })
          }
          emptyMessage="No attacker signals."
        />
      ) : null}

      {activeSubTab === 'bots' ? (
        <div className="space-y-6">
          <StatRow columns={3}>
            <StatCard
              label="Events"
              value={botsQuery.data?.summary.events ?? (botsQuery.isLoading ? undefined : 0)}
              threshold="muted"
              isLoading={botsQuery.isLoading && !botsQuery.data}
            />
            <StatCard
              label="Unique bots"
              value={botsQuery.data?.summary.unique_ips ?? (botsQuery.isLoading ? undefined : 0)}
              threshold="muted"
              isLoading={botsQuery.isLoading && !botsQuery.data}
            />
            <StatCard
              label="Blocked"
              value={botsQuery.data?.summary.blocked ?? (botsQuery.isLoading ? undefined : 0)}
              threshold="ok"
              isLoading={botsQuery.isLoading && !botsQuery.data}
            />
          </StatRow>

          {botsQuery.data && botsQuery.data.top_bots.length > 0 ? (
            <RankedTable
              rows={botsQuery.data.top_bots}
              columns={[
                {
                  key: 'ip',
                  header: 'IP',
                  render: (row) => <span className="font-mono text-xs">{row.ip}</span>,
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
                  header: 'Risk',
                  align: 'right',
                  width: '80px',
                  render: (row) => row.risk_score,
                },
              ]}
              getRowId={(row) => row.ip}
              emptyMessage="No bot pressure."
            />
          ) : (
            <EmptyState title="No bot pressure in this window." />
          )}
        </div>
      ) : null}
    </div>
  );
}
