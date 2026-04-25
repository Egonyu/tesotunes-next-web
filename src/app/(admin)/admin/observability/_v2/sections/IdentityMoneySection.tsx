'use client';

import { useMemo } from 'react';
import { useObservabilityStore } from '@/stores';
import {
  useAuthSessions,
  usePaymentsRisk,
  useStakeholderRisk,
  useIntegrations,
} from '@/lib/observability';
import type {
  IntegrationProviderRow,
  ObservabilityEvent,
  StakeholderRiskRow,
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
  { key: 'auth-sessions', label: 'Auth & Sessions' },
  { key: 'payments', label: 'Payments' },
  { key: 'stakeholders', label: 'Stakeholder risk' },
  { key: 'integrations', label: 'Integrations' },
];

function eventColumns(
  onOpen: (row: ObservabilityEvent) => void,
): RankedColumn<ObservabilityEvent>[] {
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
      key: 'actor',
      header: 'Actor',
      width: '180px',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.actor.label ?? row.actor.type ?? '\u2014'}
        </span>
      ),
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
  ];
}

export function IdentityMoneySection() {
  const filters = useObservabilityStore((s) => s.filters);
  const activeSubTab = useObservabilityShellStore((s) => s.activeSubTab) ?? 'auth-sessions';
  const setSubTab = useObservabilityShellStore((s) => s.setSubTab);
  const { open: openDetail } = useDetailSlideOver();

  const authQuery = useAuthSessions(filters, activeSubTab === 'auth-sessions');
  const paymentsQuery = usePaymentsRisk(filters, activeSubTab === 'payments');
  const stakeholderQuery = useStakeholderRisk(filters, activeSubTab === 'stakeholders');
  const integrationsQuery = useIntegrations(filters, activeSubTab === 'integrations');

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
        key: 'payment',
        header: 'Payment',
        align: 'right',
        width: '90px',
        render: (row) => row.payment_events,
      },
      {
        key: 'admin',
        header: 'Admin',
        align: 'right',
        width: '80px',
        render: (row) => row.admin_events,
      },
    ],
    [],
  );

  const providerColumns: RankedColumn<IntegrationProviderRow>[] = useMemo(
    () => [
      {
        key: 'provider',
        header: 'Provider',
        render: (row) => <span className="font-medium">{row.provider}</span>,
      },
      {
        key: 'events',
        header: 'Events',
        align: 'right',
        width: '90px',
        render: (row) => row.total_events,
      },
      {
        key: 'signatures',
        header: 'Sig fails',
        align: 'right',
        width: '90px',
        render: (row) => (
          <span className={row.signature_failures > 0 ? 'text-rose-600 dark:text-rose-300' : undefined}>
            {row.signature_failures}
          </span>
        ),
      },
      {
        key: 'replays',
        header: 'Replays',
        align: 'right',
        width: '90px',
        render: (row) => row.replays,
      },
      {
        key: 'risk',
        header: 'Max risk',
        align: 'right',
        width: '90px',
        render: (row) => row.max_risk_score,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Identity & Money"
        description="Sessions, payments, and the people / services behind them."
        subTabs={SUB_TABS}
        activeSubTab={activeSubTab}
        onSubTabChange={setSubTab}
      />

      {activeSubTab === 'auth-sessions' ? (
        <div className="space-y-6">
          <StatRow columns={3}>
            <StatCard
              label="Failed logins"
              value={authQuery.data?.summary.failed_logins ?? (authQuery.isLoading ? undefined : 0)}
              threshold={
                (authQuery.data?.summary.failed_logins ?? 0) >= 25
                  ? 'crit'
                  : (authQuery.data?.summary.failed_logins ?? 0) > 0
                    ? 'warn'
                    : 'muted'
              }
              isLoading={authQuery.isLoading && !authQuery.data}
            />
            <StatCard
              label="Successful logins"
              value={authQuery.data?.summary.successful_logins ?? (authQuery.isLoading ? undefined : 0)}
              threshold="muted"
              isLoading={authQuery.isLoading && !authQuery.data}
            />
            <StatCard
              label="Suspicious successes"
              value={authQuery.data?.summary.suspicious_successes ?? (authQuery.isLoading ? undefined : 0)}
              threshold={(authQuery.data?.summary.suspicious_successes ?? 0) > 0 ? 'crit' : 'muted'}
              isLoading={authQuery.isLoading && !authQuery.data}
            />
          </StatRow>

          <RankedTable
            rows={authQuery.data?.recent ?? []}
            columns={eventColumns((row) =>
              openDetail({ kind: 'session', id: String(row.id), label: row.title, seed: row }),
            )}
            getRowId={(row) => row.id}
            isLoading={authQuery.isLoading}
            isError={authQuery.isError}
            onRowClick={(row) => {
              const sessionId = row.correlation?.session_id ?? String(row.id);
              openDetail({ kind: 'session', id: sessionId, label: row.title, seed: row });
            }}
            emptyMessage="No recent session events."
          />
        </div>
      ) : null}

      {activeSubTab === 'payments' ? (
        <div className="space-y-6">
          <StatRow columns={4}>
            <StatCard
              label="Completed"
              value={paymentsQuery.data?.dashboard.summary.completed ?? (paymentsQuery.isLoading ? undefined : 0)}
              threshold="ok"
              isLoading={paymentsQuery.isLoading && !paymentsQuery.data}
            />
            <StatCard
              label="Failed"
              value={paymentsQuery.data?.dashboard.summary.failed ?? (paymentsQuery.isLoading ? undefined : 0)}
              threshold={(paymentsQuery.data?.dashboard.summary.failed ?? 0) > 0 ? 'warn' : 'muted'}
              isLoading={paymentsQuery.isLoading && !paymentsQuery.data}
            />
            <StatCard
              label="Open issues"
              value={paymentsQuery.data?.dashboard.summary.open_issues ?? (paymentsQuery.isLoading ? undefined : 0)}
              threshold={(paymentsQuery.data?.dashboard.summary.open_issues ?? 0) > 0 ? 'crit' : 'muted'}
              isLoading={paymentsQuery.isLoading && !paymentsQuery.data}
            />
            <StatCard
              label="Webhook risk"
              value={
                paymentsQuery.data
                  ? paymentsQuery.data.high_risk_events.filter((e) => e.category === 'webhook').length
                  : paymentsQuery.isLoading
                    ? undefined
                    : 0
              }
              threshold="muted"
              isLoading={paymentsQuery.isLoading && !paymentsQuery.data}
            />
          </StatRow>

          <RankedTable
            rows={paymentsQuery.data?.high_risk_events ?? []}
            columns={eventColumns((row) => openDetail({ kind: 'payment', id: String(row.id), label: row.title, seed: row }))}
            getRowId={(row) => row.id}
            isLoading={paymentsQuery.isLoading}
            isError={paymentsQuery.isError}
            onRowClick={(row) => {
              const ref =
                typeof row.details.payment_reference === 'string'
                  ? row.details.payment_reference
                  : String(row.id);
              openDetail({ kind: 'payment', id: ref, label: row.title, seed: row });
            }}
            emptyMessage="No high-risk payment events."
          />
        </div>
      ) : null}

      {activeSubTab === 'stakeholders' ? (
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
      ) : null}

      {activeSubTab === 'integrations' ? (
        integrationsQuery.data && integrationsQuery.data.providers.length > 0 ? (
          <RankedTable
            rows={integrationsQuery.data.providers}
            columns={providerColumns}
            getRowId={(row) => row.provider}
            isLoading={integrationsQuery.isLoading}
            isError={integrationsQuery.isError}
            emptyMessage="No integration activity."
          />
        ) : (
          <EmptyState title="No integration activity" description="Providers will appear here once webhooks or callbacks are received." />
        )
      ) : null}
    </div>
  );
}
