'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useObservabilityStore } from '@/stores';
import type {
  AttackerDetail,
  AttackerRow,
  DatabaseCollectorBreakdownRow,
  EntryPointRow,
  IncidentDetail,
  IncidentRow,
  IncidentSuggestionRow,
  IntegrationProviderRow,
  ObservabilityEntity,
  ObservabilityEvent,
  ObservabilityEventDetail,
  ObservabilityFilters,
  PaymentRiskDetail,
  SessionDetail,
  StakeholderDetail,
  StakeholderRiskRow,
  SystemHostDetail,
  ObservabilityTab,
} from '@/types/observability';
import { GlobalFilterBar } from '@/components/admin/observability/GlobalFilterBar';
import { KpiGrid } from '@/components/admin/observability/KpiGrid';
import { EventTable } from '@/components/admin/observability/EventTable';
import { AttackSurfaceTable } from '@/components/admin/observability/AttackSurfaceTable';
import { ThreatTimeline } from '@/components/admin/observability/ThreatTimeline';
import { TopAttackersPanel } from '@/components/admin/observability/TopAttackersPanel';
import { BotPressurePanel } from '@/components/admin/observability/BotPressurePanel';
import { IncidentTimeline } from '@/components/admin/observability/IncidentTimeline';
import { EventDrawer } from '@/components/admin/observability/EventDrawer';
import { AttackerDrawer } from '@/components/admin/observability/AttackerDrawer';
import { RawEvidencePanel } from '@/components/admin/observability/RawEvidencePanel';
import { StakeholderRiskPanel } from '@/components/admin/observability/StakeholderRiskPanel';
import { IntegrationsPanel } from '@/components/admin/observability/IntegrationsPanel';
import { IncidentWorkbench } from '@/components/admin/observability/IncidentWorkbench';
import { IncidentRecommendations } from '@/components/admin/observability/IncidentRecommendations';
import { IncidentDetailPanel } from '@/components/admin/observability/IncidentDetailPanel';
import { SessionDetailPanel } from '@/components/admin/observability/SessionDetailPanel';
import { PaymentRiskDetailPanel } from '@/components/admin/observability/PaymentRiskDetailPanel';
import { StakeholderDetailPanel } from '@/components/admin/observability/StakeholderDetailPanel';
import { DatabaseEventDetailPanel } from '@/components/admin/observability/DatabaseEventDetailPanel';
import { CollectorStatusPanel } from '@/components/admin/observability/CollectorStatusPanel';
import { DatabaseCollectorPanel } from '@/components/admin/observability/DatabaseCollectorPanel';
import { CollectorEventFeed } from '@/components/admin/observability/CollectorEventFeed';
import { CollectorPriorityPanel } from '@/components/admin/observability/CollectorPriorityPanel';
import { SystemRollupPanel } from '@/components/admin/observability/SystemRollupPanel';

const tabs: Array<{ key: ObservabilityTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'threats', label: 'Threats' },
  { key: 'entry-points', label: 'Entry Points' },
  { key: 'attackers', label: 'Attackers' },
  { key: 'bots', label: 'Bots' },
  { key: 'auth-sessions', label: 'Auth & Sessions' },
  { key: 'payments-risk', label: 'Payments & Financial Risk' },
  { key: 'system-host', label: 'System & Host' },
  { key: 'database', label: 'Database & Data Access' },
  { key: 'audit-trail', label: 'Audit Trail' },
  { key: 'changes', label: 'Changes / Integrity' },
  { key: 'incidents', label: 'Incidents' },
];

function paramsFromFilters(filters: ObservabilityFilters) {
  return Object.entries(filters).reduce<Record<string, string | string[]>>((acc, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) acc[key] = value;
    if (!Array.isArray(value) && value) acc[key] = value;
    return acc;
  }, {});
}

function serializeState(activeTab: ObservabilityTab, filters: ObservabilityFilters) {
  const params = new URLSearchParams();
  params.set('tab', activeTab);

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      [...value].sort().forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

function readFilters(searchParams: URLSearchParams): Partial<ObservabilityFilters> {
  const getMany = (key: string) => searchParams.getAll(key).filter(Boolean);

  return {
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    user_id: searchParams.get('user_id') ?? undefined,
    admin_id: searchParams.get('admin_id') ?? undefined,
    ip: searchParams.get('ip') ?? undefined,
    asn: searchParams.get('asn') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    route: searchParams.get('route') ?? undefined,
    payment_reference: searchParams.get('payment_reference') ?? undefined,
    host: searchParams.get('host') ?? undefined,
    container: searchParams.get('container') ?? undefined,
    incident_id: searchParams.get('incident_id') ?? undefined,
    severity: getMany('severity'),
    domain: getMany('domain'),
    category: getMany('category'),
    outcome: getMany('outcome'),
    actor_type: getMany('actor_type'),
  };
}

export default function ObservabilityPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    activeTab,
    filters,
    setActiveTab,
    setFilters,
    resetFilters,
  } = useObservabilityStore();
  const [selectedEvent, setSelectedEvent] = useState<ObservabilityEvent | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<AttackerRow | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRow | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedPaymentReference, setSelectedPaymentReference] = useState<string | null>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderRiskRow | null>(null);
  const hydratedRef = useRef(false);
  const activeTabRef = useRef(activeTab);
  const filtersRef = useRef(filters);
  const searchParamsString = searchParams.toString();
  const serializedStoreState = useMemo(() => serializeState(activeTab, filters), [activeTab, filters]);

  useEffect(() => {
    activeTabRef.current = activeTab;
    filtersRef.current = filters;
  }, [activeTab, filters]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const tab = params.get('tab') as ObservabilityTab | null;
    if (tab && tab !== activeTabRef.current && tabs.some((item) => item.key === tab)) {
      setActiveTab(tab);
    }

    const currentFilters = filtersRef.current;
    const nextFilters = readFilters(params);
    if (JSON.stringify(nextFilters) !== JSON.stringify({
      from: currentFilters.from,
      to: currentFilters.to,
      search: currentFilters.search,
      user_id: currentFilters.user_id,
      admin_id: currentFilters.admin_id,
      ip: currentFilters.ip,
      asn: currentFilters.asn,
      country: currentFilters.country,
      route: currentFilters.route,
      payment_reference: currentFilters.payment_reference,
      host: currentFilters.host,
      container: currentFilters.container,
      incident_id: currentFilters.incident_id,
      severity: currentFilters.severity,
      domain: currentFilters.domain,
      category: currentFilters.category,
      outcome: currentFilters.outcome,
      actor_type: currentFilters.actor_type,
    })) {
      setFilters(nextFilters);
    }

    hydratedRef.current = true;
  }, [searchParamsString, setActiveTab, setFilters]);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    const nextQuery = serializedStoreState;
    if (nextQuery !== searchParamsString) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [pathname, router, searchParamsString, serializedStoreState]);

  const baseParams = useMemo(() => paramsFromFilters(filters), [filters]);

  const overviewQuery = useQuery({
    queryKey: ['admin', 'observability', 'overview', baseParams],
    queryFn: () => apiGet<{ data: { summary: Record<string, number>; top_attacked_endpoints: Array<{ route: string; total: number }>; recent_events: ObservabilityEvent[] } }>('/admin/observability/overview', { params: baseParams }),
    placeholderData: (previous) => previous,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const threatsQuery = useQuery({
    queryKey: ['admin', 'observability', 'events', baseParams],
    queryFn: () => apiGet<{ data: ObservabilityEvent[]; meta: { total: number } }>('/admin/observability/events', { params: { ...baseParams, per_page: 25 } }),
    placeholderData: (previous) => previous,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const entryPointsQuery = useQuery({
    queryKey: ['admin', 'observability', 'entry-points', baseParams],
    queryFn: () => apiGet<{ data: EntryPointRow[] }>('/admin/observability/entry-points', { params: baseParams }),
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const attackersQuery = useQuery({
    queryKey: ['admin', 'observability', 'attackers', baseParams],
    queryFn: () => apiGet<{ data: AttackerRow[] }>('/admin/observability/attackers', { params: baseParams }),
    placeholderData: (previous) => previous,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const attackerDetailQuery = useQuery({
    queryKey: ['admin', 'observability', 'attacker-detail', selectedAttacker?.id],
    queryFn: () => apiGet<{ data: AttackerDetail }>(`/admin/observability/attackers/${selectedAttacker?.id}`),
    enabled: !!selectedAttacker,
  });

  const botsQuery = useQuery({
    queryKey: ['admin', 'observability', 'bots', baseParams],
    queryFn: () => apiGet<{ data: { summary: Record<string, number>; top_bots: Array<{ ip: string; events: number; risk_score: number }> } }>('/admin/observability/bots', { params: baseParams }),
    enabled: activeTab === 'bots' || activeTab === 'overview',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const authQuery = useQuery({
    queryKey: ['admin', 'observability', 'auth-sessions', baseParams],
    queryFn: () => apiGet<{ data: { summary: Record<string, number>; recent: ObservabilityEvent[] } }>('/admin/observability/auth-sessions', { params: baseParams }),
    enabled: activeTab === 'auth-sessions' || activeTab === 'overview',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const sessionDetailQuery = useQuery({
    queryKey: ['admin', 'observability', 'auth-session-detail', selectedSessionId],
    queryFn: () => apiGet<{ data: SessionDetail }>(`/admin/observability/auth-sessions/${selectedSessionId}`),
    enabled: !!selectedSessionId && activeTab === 'auth-sessions',
  });

  const paymentsQuery = useQuery({
    queryKey: ['admin', 'observability', 'payments-risk', baseParams],
    queryFn: () => apiGet<{ data: { dashboard: { summary: Record<string, number> }; high_risk_events: ObservabilityEvent[] } }>('/admin/observability/payments-risk', { params: baseParams }),
    enabled: activeTab === 'payments-risk' || activeTab === 'overview',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const paymentDetailQuery = useQuery({
    queryKey: ['admin', 'observability', 'payment-risk-detail', selectedPaymentReference],
    queryFn: () => apiGet<{ data: PaymentRiskDetail }>(`/admin/observability/payments-risk/${selectedPaymentReference}`),
    enabled: !!selectedPaymentReference && activeTab === 'payments-risk',
  });

  const systemQuery = useQuery({
    queryKey: ['admin', 'observability', 'system-host', baseParams],
    queryFn: () => apiGet<{ data: SystemHostDetail }>('/admin/observability/system-host', { params: baseParams }),
    enabled: activeTab === 'system-host',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const databaseQuery = useQuery({
    queryKey: ['admin', 'observability', 'database', baseParams],
    queryFn: () => apiGet<{ data: { summary: Record<string, number>; stats: Record<string, unknown>; slow_queries: Array<Record<string, unknown>>; collector_breakdown: DatabaseCollectorBreakdownRow[]; priority_alerts: ObservabilityEvent[]; collector_recent: ObservabilityEvent[]; recent: ObservabilityEvent[] } }>('/admin/observability/database', { params: baseParams }),
    enabled: activeTab === 'database',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const databaseEventDetailQuery = useQuery({
    queryKey: ['admin', 'observability', 'database-event-detail', selectedEvent?.id],
    queryFn: () => apiGet<{ data: ObservabilityEventDetail }>(`/admin/observability/events/${selectedEvent?.id}`),
    enabled: ['database', 'system-host', 'changes'].includes(activeTab) && !!selectedEvent,
  });

  const auditQuery = useQuery({
    queryKey: ['admin', 'observability', 'audit-trail', baseParams],
    queryFn: () => apiGet<{ data: { recent: ObservabilityEvent[] } }>('/admin/observability/audit-trail', { params: baseParams }),
    enabled: activeTab === 'audit-trail',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const changesQuery = useQuery({
    queryKey: ['admin', 'observability', 'changes', baseParams],
    queryFn: () => apiGet<{ data: { recent: ObservabilityEvent[]; integrity_snapshots: Array<Record<string, unknown>> } }>('/admin/observability/changes', { params: baseParams }),
    enabled: activeTab === 'changes',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const incidentsQuery = useQuery({
    queryKey: ['admin', 'observability', 'incidents', baseParams],
    queryFn: () => apiGet<{ data: IncidentRow[] }>('/admin/observability/incidents', { params: baseParams }),
    enabled: activeTab === 'incidents' || activeTab === 'overview',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const stakeholderRiskQuery = useQuery({
    queryKey: ['admin', 'observability', 'stakeholder-risk', baseParams],
    queryFn: () => apiGet<{ data: { summary: Record<string, number>; actors: StakeholderRiskRow[] } }>('/admin/observability/stakeholder-risk', { params: baseParams }),
    enabled: activeTab === 'overview' || activeTab === 'auth-sessions' || activeTab === 'payments-risk',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const stakeholderDetailQuery = useQuery({
    queryKey: ['admin', 'observability', 'stakeholder-detail', selectedStakeholder?.actor_type, selectedStakeholder?.actor_id],
    queryFn: () => apiGet<{ data: StakeholderDetail }>(`/admin/observability/stakeholder-risk/${selectedStakeholder?.actor_type}/${selectedStakeholder?.actor_id}`),
    enabled: !!selectedStakeholder && (activeTab === 'overview' || activeTab === 'auth-sessions' || activeTab === 'payments-risk'),
  });

  const integrationsQuery = useQuery({
    queryKey: ['admin', 'observability', 'integrations', baseParams],
    queryFn: () => apiGet<{ data: { summary: Record<string, number>; providers: IntegrationProviderRow[]; recent: ObservabilityEvent[] } }>('/admin/observability/integrations', { params: baseParams }),
    enabled: activeTab === 'overview' || activeTab === 'payments-risk',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const incidentSuggestionsQuery = useQuery({
    queryKey: ['admin', 'observability', 'incident-suggestions', baseParams],
    queryFn: () => apiGet<{ data: IncidentSuggestionRow[] }>('/admin/observability/incidents/suggestions', { params: baseParams }),
    enabled: activeTab === 'incidents' || activeTab === 'overview',
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const incidentDetailQuery = useQuery({
    queryKey: ['admin', 'observability', 'incident-detail', selectedIncident?.id],
    queryFn: () => apiGet<{ data: IncidentDetail }>(`/admin/observability/incidents/${selectedIncident?.id}`),
    enabled: !!selectedIncident && activeTab === 'incidents',
  });

  const overview = overviewQuery.data?.data;
  const events = threatsQuery.data?.data ?? [];
  const entryPoints = entryPointsQuery.data?.data ?? [];
  const attackers = attackersQuery.data?.data ?? [];
  const incidents = incidentsQuery.data?.data ?? [];
  const incidentSuggestions = incidentSuggestionsQuery.data?.data ?? [];

  useEffect(() => {
    if (!selectedIncident && incidents.length > 0) {
      setSelectedIncident(incidents[0]);
      return;
    }

    if (selectedIncident && !incidents.some((incident) => incident.id === selectedIncident.id)) {
      setSelectedIncident(incidents[0] ?? null);
    }
  }, [incidents, selectedIncident]);

  const createIncidentMutation = useMutation({
    mutationFn: (payload: { title: string; severity: string; summary?: string; notes?: string; event_ids: number[] }) =>
      apiPost<{ data: IncidentRow }>('/admin/observability/incidents', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incident-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incident-detail'] });
    },
  });

  const updateIncidentMutation = useMutation({
    mutationFn: ({ incidentId, payload }: { incidentId: number; payload: { status?: string; severity?: string; notes?: string; append_note?: string; event_ids?: number[] } }) =>
      apiPatch<{ data: IncidentRow }>(`/admin/observability/incidents/${incidentId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incident-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'overview'] });
    },
  });

  const assignIncidentMutation = useMutation({
    mutationFn: (incidentId: number) =>
      apiPatch<{ data: IncidentRow }>(`/admin/observability/incidents/${incidentId}/assign`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incident-detail'] });
    },
  });

  const releaseIncidentMutation = useMutation({
    mutationFn: (incidentId: number) =>
      apiPatch<{ data: IncidentRow }>(`/admin/observability/incidents/${incidentId}/release`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'observability', 'incident-detail'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Observability</h1>
        <p className="text-muted-foreground">Security operations and cross-system investigation console for threats, bots, payments, audit, and infrastructure changes.</p>
      </div>

      <GlobalFilterBar filters={filters} onApply={setFilters} onReset={resetFilters} />

      <Tabs value={activeTab} defaultValue="overview" onValueChange={(value) => setActiveTab(value as ObservabilityTab)} className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl p-2">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="rounded-xl">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <KpiGrid
            items={[
              { label: 'Active threats', value: overview?.summary.active_threats ?? 0 },
              { label: 'Suspicious successes', value: overview?.summary.suspicious_successes ?? 0 },
              { label: 'Bot pressure', value: overview?.summary.bot_pressure ?? 0 },
              { label: 'Unresolved incidents', value: overview?.summary.unresolved_incidents ?? 0 },
              { label: 'Stale collectors', value: overview?.summary.collector_stale_sources ?? 0 },
              { label: 'Telemetry gaps', value: overview?.summary.collector_telemetry_gaps ?? 0 },
              { label: 'Critical host signals', value: overview?.summary.critical_system_signals ?? 0 },
              { label: 'DB auth failures', value: overview?.summary.db_auth_failures ?? 0 },
              { label: 'Privileged DB writes', value: overview?.summary.db_privileged_writes ?? 0 },
              { label: 'Destructive DB queries', value: overview?.summary.db_destructive_queries ?? 0 },
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
            <ThreatTimeline events={overview?.recent_events ?? []} />
            <TopAttackersPanel attackers={attackers} onSelect={setSelectedAttacker} />
          </div>
          <BotPressurePanel summary={botsQuery.data?.data.summary} />
          <div className="grid gap-6 xl:grid-cols-2">
            <IncidentTimeline incidents={incidents} />
            <StakeholderRiskPanel actors={stakeholderRiskQuery.data?.data.actors ?? []} onSelect={setSelectedStakeholder} />
          </div>
          <StakeholderDetailPanel
            detail={stakeholderDetailQuery.data?.data ?? null}
            onSelectEvent={setSelectedEvent}
            onPivotIp={(ip) => {
              setFilters({ ip, payment_reference: undefined, search: ip });
              setActiveTab('attackers');
            }}
            onPivotSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setFilters({ search: sessionId, ip: undefined, payment_reference: undefined });
              setActiveTab('auth-sessions');
            }}
            onPivotPayment={(paymentReference) => {
              setSelectedPaymentReference(paymentReference);
              setFilters({ payment_reference: paymentReference, search: paymentReference, ip: undefined });
              setActiveTab('payments-risk');
            }}
          />
          <IntegrationsPanel
            summary={integrationsQuery.data?.data.summary}
            providers={integrationsQuery.data?.data.providers ?? []}
          />
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <EventTable events={events} onSelect={setSelectedEvent} />
        </TabsContent>

        <TabsContent value="entry-points" className="space-y-6">
          <AttackSurfaceTable entries={entryPoints} />
        </TabsContent>

        <TabsContent value="attackers" className="space-y-6">
          <TopAttackersPanel attackers={attackers} onSelect={setSelectedAttacker} />
          <AttackerDrawer attacker={selectedAttacker} detail={attackerDetailQuery.data?.data ?? null} />
        </TabsContent>

        <TabsContent value="bots" className="space-y-6">
          <BotPressurePanel summary={botsQuery.data?.data.summary} />
          <RawEvidencePanel data={{ top_bots: botsQuery.data?.data.top_bots ?? [] }} />
        </TabsContent>

        <TabsContent value="auth-sessions" className="space-y-6">
          <KpiGrid items={[
            { label: 'Failed logins', value: authQuery.data?.data.summary.failed_logins ?? 0 },
            { label: 'Successful logins', value: authQuery.data?.data.summary.successful_logins ?? 0 },
            { label: 'Suspicious successes', value: authQuery.data?.data.summary.suspicious_successes ?? 0 },
          ]} />
          <StakeholderRiskPanel actors={stakeholderRiskQuery.data?.data.actors ?? []} onSelect={setSelectedStakeholder} />
          <StakeholderDetailPanel
            detail={stakeholderDetailQuery.data?.data ?? null}
            onSelectEvent={setSelectedEvent}
            onPivotIp={(ip) => {
              setFilters({ ip, payment_reference: undefined, search: ip });
              setActiveTab('attackers');
            }}
            onPivotSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setFilters({ search: sessionId, ip: undefined, payment_reference: undefined });
              setActiveTab('auth-sessions');
            }}
            onPivotPayment={(paymentReference) => {
              setSelectedPaymentReference(paymentReference);
              setFilters({ payment_reference: paymentReference, search: paymentReference, ip: undefined });
              setActiveTab('payments-risk');
            }}
          />
          <EventTable events={authQuery.data?.data.recent ?? []} onSelect={setSelectedEvent} />
          <SessionDetailPanel detail={sessionDetailQuery.data?.data ?? null} onSelectEvent={setSelectedEvent} />
        </TabsContent>

        <TabsContent value="payments-risk" className="space-y-6">
          {(() => {
            const webhookEvents = (paymentsQuery.data?.data.high_risk_events ?? []).filter((event) => event.category === 'webhook');

            return (
          <KpiGrid items={[
            { label: 'Completed payments', value: paymentsQuery.data?.data.dashboard.summary.completed ?? 0 },
            { label: 'Failed payments', value: paymentsQuery.data?.data.dashboard.summary.failed ?? 0 },
            { label: 'Open issues', value: paymentsQuery.data?.data.dashboard.summary.open_issues ?? 0 },
            { label: 'Webhook risk events', value: webhookEvents.length || (paymentsQuery.data?.data.dashboard.summary.invalid_webhook_signatures ?? 0) },
          ]} />
            );
          })()}
          <StakeholderRiskPanel actors={stakeholderRiskQuery.data?.data.actors ?? []} onSelect={setSelectedStakeholder} />
          <StakeholderDetailPanel
            detail={stakeholderDetailQuery.data?.data ?? null}
            onSelectEvent={setSelectedEvent}
            onPivotIp={(ip) => {
              setFilters({ ip, payment_reference: undefined, search: ip });
              setActiveTab('attackers');
            }}
            onPivotSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setFilters({ search: sessionId, ip: undefined, payment_reference: undefined });
              setActiveTab('auth-sessions');
            }}
            onPivotPayment={(paymentReference) => {
              setSelectedPaymentReference(paymentReference);
              setFilters({ payment_reference: paymentReference, search: paymentReference, ip: undefined });
              setActiveTab('payments-risk');
            }}
          />
          <IntegrationsPanel
            summary={integrationsQuery.data?.data.summary}
            providers={integrationsQuery.data?.data.providers ?? []}
          />
          <EventTable
            events={paymentsQuery.data?.data.high_risk_events ?? []}
            onSelect={(event) => {
              setSelectedEvent(event);
              const reference = typeof event.details.payment_reference === 'string' ? event.details.payment_reference : null;
              if (reference) {
                setSelectedPaymentReference(reference);
              }
            }}
          />
          <PaymentRiskDetailPanel detail={paymentDetailQuery.data?.data ?? null} onSelectEvent={setSelectedEvent} />
        </TabsContent>

        <TabsContent value="system-host" className="space-y-6">
          <CollectorStatusPanel
            collector={systemQuery.data?.data.collector ?? null}
            onSelectHost={(host) => {
              setFilters({ host, search: host });
            }}
          />
          <CollectorEventFeed
            title="Recent Collector Events"
            events={systemQuery.data?.data.collector?.recent ?? []}
            onSelect={setSelectedEvent}
          />
          <CollectorPriorityPanel
            title="Priority Collector Alerts"
            events={systemQuery.data?.data.collector?.priority_alerts ?? []}
            onSelect={setSelectedEvent}
          />
          <SystemRollupPanel rollups={systemQuery.data?.data.rollups ?? null} />
          <RawEvidencePanel data={systemQuery.data?.data.deployment ?? systemQuery.data?.data.health} />
          <EventTable events={systemQuery.data?.data.changes ?? []} onSelect={setSelectedEvent} />
          <DatabaseEventDetailPanel
            title="System Event Detail"
            emptyText="Select a system or host event to inspect related activity and pivot into the linked attacker, session, or payment flow."
            detail={databaseEventDetailQuery.data?.data ?? null}
            onPivotIp={(ip) => {
              setFilters({ ip, payment_reference: undefined, search: ip });
              setActiveTab('attackers');
            }}
            onPivotSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setFilters({ search: sessionId, ip: undefined, payment_reference: undefined });
              setActiveTab('auth-sessions');
            }}
            onPivotPayment={(paymentReference) => {
              setSelectedPaymentReference(paymentReference);
              setFilters({ payment_reference: paymentReference, search: paymentReference, ip: undefined });
              setActiveTab('payments-risk');
            }}
          />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <KpiGrid items={[
            { label: 'Database events', value: databaseQuery.data?.data.summary.events ?? 0 },
            { label: 'Auth failures', value: databaseQuery.data?.data.summary.auth_failures ?? 0 },
            { label: 'Privileged writes', value: databaseQuery.data?.data.summary.privileged_writes ?? 0 },
            { label: 'Schema changes', value: databaseQuery.data?.data.summary.schema_changes ?? 0 },
            { label: 'Destructive queries', value: databaseQuery.data?.data.summary.destructive_queries ?? 0 },
          ]} />
          <DatabaseCollectorPanel breakdown={databaseQuery.data?.data.collector_breakdown ?? []} />
          <CollectorPriorityPanel
            title="Priority Collector DB Alerts"
            events={databaseQuery.data?.data.priority_alerts ?? []}
            onSelect={setSelectedEvent}
          />
          <CollectorEventFeed
            title="Recent Collector DB Events"
            events={databaseQuery.data?.data.collector_recent ?? []}
            onSelect={setSelectedEvent}
          />
          <RawEvidencePanel data={{ stats: databaseQuery.data?.data.stats, slow_queries: databaseQuery.data?.data.slow_queries }} />
          <EventTable events={databaseQuery.data?.data.recent ?? []} onSelect={setSelectedEvent} />
          <DatabaseEventDetailPanel
            detail={databaseEventDetailQuery.data?.data ?? null}
            onPivotIp={(ip) => {
              setFilters({ ip, payment_reference: undefined, search: ip });
              setActiveTab('attackers');
            }}
            onPivotSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setFilters({ search: sessionId, ip: undefined, payment_reference: undefined });
              setActiveTab('auth-sessions');
            }}
            onPivotPayment={(paymentReference) => {
              setSelectedPaymentReference(paymentReference);
              setFilters({ payment_reference: paymentReference, search: paymentReference, ip: undefined });
              setActiveTab('payments-risk');
            }}
          />
        </TabsContent>

        <TabsContent value="audit-trail" className="space-y-6">
          <EventTable events={auditQuery.data?.data.recent ?? []} onSelect={setSelectedEvent} />
        </TabsContent>

        <TabsContent value="changes" className="space-y-6">
          <RawEvidencePanel data={{ integrity_snapshots: changesQuery.data?.data.integrity_snapshots ?? [] }} />
          <EventTable events={changesQuery.data?.data.recent ?? []} onSelect={setSelectedEvent} />
          <DatabaseEventDetailPanel
            title="Integrity Event Detail"
            emptyText="Select a change or integrity event to inspect related activity and pivot into the linked attacker, session, or payment flow."
            detail={databaseEventDetailQuery.data?.data ?? null}
            onPivotIp={(ip) => {
              setFilters({ ip, payment_reference: undefined, search: ip });
              setActiveTab('attackers');
            }}
            onPivotSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setFilters({ search: sessionId, ip: undefined, payment_reference: undefined });
              setActiveTab('auth-sessions');
            }}
            onPivotPayment={(paymentReference) => {
              setSelectedPaymentReference(paymentReference);
              setFilters({ payment_reference: paymentReference, search: paymentReference, ip: undefined });
              setActiveTab('payments-risk');
            }}
          />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <IncidentRecommendations
            suggestions={incidentSuggestions}
            onCreate={(suggestion) => createIncidentMutation.mutate({
              title: suggestion.title,
              severity: suggestion.severity,
              summary: suggestion.summary,
              notes: `Created from ${suggestion.event_count} auto-grouped observability events.`,
              event_ids: suggestion.event_ids,
            })}
            isSaving={createIncidentMutation.isPending}
          />
          <div className="grid gap-6 xl:grid-cols-[0.9fr,1.4fr]">
            <IncidentTimeline incidents={incidents} selectedIncidentId={selectedIncident?.id} onSelect={setSelectedIncident} />
            <IncidentDetailPanel
              incident={selectedIncident}
              detail={incidentDetailQuery.data?.data ?? null}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              onAssignToMe={(incident) => assignIncidentMutation.mutate(incident.id)}
              onReleaseOwnership={(incident) => releaseIncidentMutation.mutate(incident.id)}
              onAttachSelectedEvent={(incident, event) => {
                const currentEventIds = incidentDetailQuery.data?.data?.incident.id === incident.id
                  ? (incidentDetailQuery.data?.data?.incident.event_ids ?? incident.event_ids ?? [])
                  : (incident.event_ids ?? []);
                const eventIds = currentEventIds.includes(event.id)
                  ? currentEventIds.filter((id) => id !== event.id)
                  : Array.from(new Set([...currentEventIds, event.id]));
                updateIncidentMutation.mutate({
                  incidentId: incident.id,
                  payload: { event_ids: eventIds },
                });
              }}
              onAppendNote={(incident, note) => {
                updateIncidentMutation.mutate({
                  incidentId: incident.id,
                  payload: { append_note: note },
                });
              }}
              onSetStatus={(incident, status) => {
                updateIncidentMutation.mutate({
                  incidentId: incident.id,
                  payload: { status },
                });
              }}
              onPivotEntity={(entity: ObservabilityEntity) => {
                if (entity.entity_type === 'ip') {
                  setFilters({ ip: entity.label, payment_reference: undefined, search: entity.label });
                  setActiveTab('attackers');
                  return;
                }

                if (entity.entity_type === 'session') {
                  setSelectedSessionId(entity.label);
                  setFilters({ search: entity.label, ip: undefined, payment_reference: undefined });
                  setActiveTab('auth-sessions');
                  return;
                }

                if (entity.entity_type === 'payment_reference') {
                  setSelectedPaymentReference(entity.label);
                  setFilters({ payment_reference: entity.label, search: entity.label, ip: undefined });
                  setActiveTab('payments-risk');
                  return;
                }

                setFilters({ search: entity.label });
                setActiveTab('audit-trail');
              }}
              isSaving={assignIncidentMutation.isPending || releaseIncidentMutation.isPending || updateIncidentMutation.isPending}
            />
          </div>
          <IncidentWorkbench
            selectedEvent={selectedEvent}
            incidents={incidents}
            onCreate={(payload) => createIncidentMutation.mutate(payload)}
            onUpdate={(incidentId, payload) => updateIncidentMutation.mutate({ incidentId, payload })}
            isSaving={createIncidentMutation.isPending || updateIncidentMutation.isPending}
          />
          <RawEvidencePanel data={{ incidents }} />
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 xl:grid-cols-2">
        <EventDrawer event={selectedEvent} />
        <RawEvidencePanel data={selectedEvent?.raw_ref} />
      </div>
    </div>
  );
}
