'use client';

import { useMemo, useState } from 'react';
import { useObservabilityStore } from '@/stores';
import {
  useIncidents,
  useIncidentSuggestions,
  useAuditTrail,
  useCreateIncident,
} from '@/lib/observability';
import type {
  IncidentRow,
  IncidentSuggestionRow,
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
  { key: 'incidents', label: 'Incidents' },
  { key: 'audit', label: 'Audit trail' },
];

function severityClass(severity: string | null | undefined) {
  switch (severity) {
    case 'critical':
      return 'font-semibold text-rose-600 dark:text-rose-300';
    case 'high':
      return 'font-semibold text-amber-600 dark:text-amber-300';
    case 'medium':
      return 'text-sky-600 dark:text-sky-300';
    default:
      return 'text-muted-foreground';
  }
}

function statusClass(status: string | null | undefined) {
  switch (status) {
    case 'open':
      return 'text-rose-600 dark:text-rose-300';
    case 'investigating':
    case 'acknowledged':
      return 'text-amber-600 dark:text-amber-300';
    case 'resolved':
    case 'closed':
      return 'text-emerald-600 dark:text-emerald-300';
    default:
      return 'text-muted-foreground';
  }
}

export function InvestigationsSection() {
  const filters = useObservabilityStore((s) => s.filters);
  const activeSubTab = useObservabilityShellStore((s) => s.activeSubTab) ?? 'incidents';
  const setSubTab = useObservabilityShellStore((s) => s.setSubTab);
  const { open: openDetail } = useDetailSlideOver();

  const incidentsQuery = useIncidents(filters, activeSubTab === 'incidents');
  const suggestionsQuery = useIncidentSuggestions(filters, activeSubTab === 'incidents');
  const auditQuery = useAuditTrail(filters, activeSubTab === 'audit');
  const createIncident = useCreateIncident();

  const [creatingKey, setCreatingKey] = useState<string | null>(null);

  const incidents: IncidentRow[] = incidentsQuery.data ?? [];
  const suggestions: IncidentSuggestionRow[] = suggestionsQuery.data ?? [];

  const openIncidents = useMemo(
    () => incidents.filter((row) => row.status !== 'resolved' && row.status !== 'closed'),
    [incidents],
  );
  const resolvedIncidents = useMemo(
    () => incidents.filter((row) => row.status === 'resolved' || row.status === 'closed'),
    [incidents],
  );
  const criticalCount = useMemo(
    () => openIncidents.filter((row) => row.severity === 'critical').length,
    [openIncidents],
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
              {row.incident_key}
              {row.detected_at ? ' \u00b7 ' + new Date(row.detected_at).toLocaleString() : ''}
            </span>
          </div>
        ),
      },
      {
        key: 'severity',
        header: 'Severity',
        width: '110px',
        render: (row) => <span className={severityClass(row.severity)}>{row.severity}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        width: '130px',
        render: (row) => <span className={statusClass(row.status)}>{row.status}</span>,
      },
      {
        key: 'owner',
        header: 'Owner',
        width: '160px',
        render: (row) => (
          <span className="text-xs text-muted-foreground">
            {row.owner?.name ?? row.owner?.email ?? 'Unassigned'}
          </span>
        ),
      },
      {
        key: 'activity',
        header: 'Activity',
        align: 'right',
        width: '90px',
        render: (row) => row.activity_count ?? 0,
      },
    ],
    [],
  );

  const suggestionColumns: RankedColumn<IncidentSuggestionRow>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Suggested incident',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.title}</span>
            <span className="text-xs text-muted-foreground">
              {row.domains.slice(0, 3).join(', ') || '\u2014'}
              {row.last_seen_at ? ' \u00b7 last ' + new Date(row.last_seen_at).toLocaleString() : ''}
            </span>
          </div>
        ),
      },
      {
        key: 'severity',
        header: 'Severity',
        width: '110px',
        render: (row) => <span className={severityClass(row.severity)}>{row.severity}</span>,
      },
      {
        key: 'events',
        header: 'Events',
        align: 'right',
        width: '90px',
        render: (row) => row.event_count,
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
        key: 'action',
        header: '',
        align: 'right',
        width: '120px',
        render: (row) => {
          const isCreating =
            createIncident.isPending && creatingKey === row.suggestion_key;
          return (
            <button
              type="button"
              className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium shadow-sm transition hover:bg-muted disabled:opacity-50"
              disabled={createIncident.isPending}
              onClick={(e) => {
                e.stopPropagation();
                setCreatingKey(row.suggestion_key);
                createIncident.mutate(
                  {
                    title: row.title,
                    severity: row.severity || 'medium',
                    summary: row.summary,
                    event_ids: row.event_ids,
                  },
                  {
                    onSettled: () => setCreatingKey(null),
                  },
                );
              }}
            >
              {isCreating ? 'Creating\u2026' : 'Promote'}
            </button>
          );
        },
      },
    ],
    [createIncident, creatingKey],
  );

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
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Investigations"
        description="Open incidents, suggestions, and a full audit trail."
        subTabs={SUB_TABS}
        activeSubTab={activeSubTab}
        onSubTabChange={setSubTab}
      />

      {activeSubTab === 'incidents' ? (
        <div className="space-y-6">
          <StatRow columns={4}>
            <StatCard
              label="Open incidents"
              value={openIncidents.length}
              threshold={openIncidents.length >= 5 ? 'crit' : openIncidents.length > 0 ? 'warn' : 'muted'}
              isLoading={incidentsQuery.isLoading && !incidentsQuery.data}
            />
            <StatCard
              label="Critical"
              value={criticalCount}
              threshold={criticalCount > 0 ? 'crit' : 'muted'}
              isLoading={incidentsQuery.isLoading && !incidentsQuery.data}
            />
            <StatCard
              label="Resolved"
              value={resolvedIncidents.length}
              threshold="ok"
              isLoading={incidentsQuery.isLoading && !incidentsQuery.data}
            />
            <StatCard
              label="Suggestions"
              value={suggestions.length}
              threshold={suggestions.length > 0 ? 'info' : 'muted'}
              isLoading={suggestionsQuery.isLoading && !suggestionsQuery.data}
            />
          </StatRow>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Open incidents</h3>
            <RankedTable
              rows={openIncidents}
              columns={incidentColumns}
              getRowId={(row) => row.id}
              isLoading={incidentsQuery.isLoading}
              isError={incidentsQuery.isError}
              onRowClick={(row) =>
                openDetail({ kind: 'incident', id: String(row.id), label: row.title, seed: row })
              }
              emptyMessage="No open incidents."
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Suggestions</h3>
            {suggestions.length === 0 && !suggestionsQuery.isLoading ? (
              <EmptyState
                title="No suggestions right now"
                description="Suggestions appear when clustered events exceed the threshold."
              />
            ) : (
              <RankedTable
                rows={suggestions}
                columns={suggestionColumns}
                getRowId={(row) => row.suggestion_key}
                isLoading={suggestionsQuery.isLoading}
                isError={suggestionsQuery.isError}
                emptyMessage="No suggestions."
              />
            )}
          </div>

          {resolvedIncidents.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Recently resolved</h3>
              <RankedTable
                rows={resolvedIncidents}
                columns={incidentColumns}
                getRowId={(row) => row.id}
                onRowClick={(row) =>
                  openDetail({ kind: 'incident', id: String(row.id), label: row.title, seed: row })
                }
                emptyMessage="No resolved incidents."
                compact
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {activeSubTab === 'audit' ? (
        <RankedTable
          rows={auditQuery.data ?? []}
          columns={eventColumns}
          getRowId={(row) => row.id}
          isLoading={auditQuery.isLoading}
          isError={auditQuery.isError}
          onRowClick={(row) =>
            openDetail({ kind: 'event', id: String(row.id), label: row.title, seed: row })
          }
          emptyMessage="No audit events in this window."
        />
      ) : null}
    </div>
  );
}
