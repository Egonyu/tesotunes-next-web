'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { ObservabilityEvent, ObservabilityFilters } from '@/types/observability';
import { observabilityKeys } from '../keys';
import { paramsFromFilters } from '../params';

export interface OverviewSummary {
  active_threats?: number;
  suspicious_successes?: number;
  bot_pressure?: number;
  unresolved_incidents?: number;
  collector_stale_sources?: number;
  collector_telemetry_gaps?: number;
  critical_system_signals?: number;
  db_auth_failures?: number;
  db_privileged_writes?: number;
  db_destructive_queries?: number;
  [key: string]: number | undefined;
}

export interface ObservabilityOverview {
  summary: OverviewSummary;
  top_attacked_endpoints: Array<{ route: string; total: number }>;
  recent_events: ObservabilityEvent[];
}

export function useObservabilityOverview(
  filters: ObservabilityFilters,
  options?: Omit<UseQueryOptions<{ data: ObservabilityOverview }, Error, ObservabilityOverview>, 'queryKey' | 'queryFn' | 'select'>,
) {
  return useQuery({
    queryKey: observabilityKeys.overview(filters),
    queryFn: () =>
      apiGet<{ data: ObservabilityOverview }>('/admin/observability/overview', {
        params: paramsFromFilters(filters),
      }),
    select: (response) => response.data,
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    ...options,
  });
}

export interface ObservabilityPosture {
  summary: {
    unresolved_incidents: number;
    collector_stale_sources: number;
    db_auth_failures: number;
    critical_system_signals: number;
  };
  generated_at?: string;
}

export function usePosture(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: [...observabilityKeys.overview(filters), 'posture'],
    queryFn: () =>
      apiGet<{ data: ObservabilityPosture }>('/admin/observability/posture', {
        params: paramsFromFilters(filters),
      }),
    select: (response) => response.data,
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}
