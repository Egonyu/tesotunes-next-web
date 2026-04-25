import type { ObservabilityFilters } from '@/types/observability';

/**
 * Central query-key factory. Every observability hook funnels through here so invalidation
 * stays reliable (e.g. `queryClient.invalidateQueries({ queryKey: observabilityKeys.all })`
 * clears the whole surface).
 */
export const observabilityKeys = {
  all: ['admin', 'observability'] as const,

  overview: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'overview', filters] as const,
  events: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'events', filters] as const,
  eventDetail: (id: number | null | undefined) => [...observabilityKeys.all, 'event-detail', id] as const,

  entryPoints: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'entry-points', filters] as const,

  attackers: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'attackers', filters] as const,
  attackerDetail: (id: string | number | null | undefined) => [...observabilityKeys.all, 'attacker-detail', id] as const,

  bots: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'bots', filters] as const,

  authSessions: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'auth-sessions', filters] as const,
  sessionDetail: (id: string | null | undefined) => [...observabilityKeys.all, 'auth-session-detail', id] as const,

  paymentsRisk: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'payments-risk', filters] as const,
  paymentsRiskDetail: (reference: string | null | undefined) =>
    [...observabilityKeys.all, 'payment-risk-detail', reference] as const,

  systemHost: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'system-host', filters] as const,

  database: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'database', filters] as const,

  auditTrail: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'audit-trail', filters] as const,

  changes: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'changes', filters] as const,

  incidents: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'incidents', filters] as const,
  incidentDetail: (id: number | null | undefined) => [...observabilityKeys.all, 'incident-detail', id] as const,
  incidentSuggestions: (filters: ObservabilityFilters) =>
    [...observabilityKeys.all, 'incident-suggestions', filters] as const,

  stakeholderRisk: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'stakeholder-risk', filters] as const,
  stakeholderDetail: (actorType: string | null | undefined, actorId: string | number | null | undefined) =>
    [...observabilityKeys.all, 'stakeholder-detail', actorType, actorId] as const,

  integrations: (filters: ObservabilityFilters) => [...observabilityKeys.all, 'integrations', filters] as const,
} as const;
