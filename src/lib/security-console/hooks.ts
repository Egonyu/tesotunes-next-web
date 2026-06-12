'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type {
  DomainSummary,
  FeedFilters,
  FeedResponse,
  SecurityIncident,
  SecurityPosture,
} from './types';

const BASE = '/admin/observability/console';

/** Shared polling profile — the console refreshes itself like a live SOC view. */
const live = {
  refetchInterval: 20_000,
  refetchOnWindowFocus: false,
  staleTime: 10_000,
  placeholderData: <T,>(previous: T) => previous,
} as const;

export function useSecurityPosture() {
  return useQuery({
    queryKey: ['security-console', 'posture'],
    queryFn: () => apiGet<{ data: SecurityPosture }>(`${BASE}/posture`),
    select: (response) => response.data,
    ...live,
  });
}

export function useSecurityIncidents() {
  return useQuery({
    queryKey: ['security-console', 'incidents'],
    queryFn: () => apiGet<{ data: SecurityIncident[] }>(`${BASE}/incidents`),
    select: (response) => response.data,
    ...live,
  });
}

export function useSecurityFeed(filters: FeedFilters) {
  return useQuery({
    queryKey: ['security-console', 'feed', filters],
    queryFn: () =>
      apiGet<FeedResponse>(`${BASE}/feed`, {
        params: {
          domain: filters.domain || undefined,
          severity: filters.severity || undefined,
          outcome: filters.outcome || undefined,
          min_risk: filters.min_risk || undefined,
          search: filters.search || undefined,
          per_page: filters.per_page ?? 30,
        },
      }),
    ...live,
  });
}

export function useDomainSummary(domain: string, enabled = true) {
  return useQuery({
    queryKey: ['security-console', 'domain', domain],
    queryFn: () => apiGet<{ data: DomainSummary }>(`${BASE}/domain/${domain}`),
    select: (response) => response.data,
    enabled,
    ...live,
  });
}
