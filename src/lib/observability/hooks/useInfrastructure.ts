'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type {
  DatabaseCollectorBreakdownRow,
  ObservabilityEvent,
  ObservabilityEventDetail,
  ObservabilityFilters,
  SystemHostDetail,
} from '@/types/observability';
import { observabilityKeys } from '../keys';
import { paramsFromFilters } from '../params';

export function useSystemHost(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.systemHost(filters),
    queryFn: () =>
      apiGet<{ data: SystemHostDetail }>('/admin/observability/system-host', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export interface DatabaseResponse {
  summary: Record<string, number>;
  stats: Record<string, unknown>;
  slow_queries: Array<Record<string, unknown>>;
  collector_breakdown: DatabaseCollectorBreakdownRow[];
  priority_alerts: ObservabilityEvent[];
  collector_recent: ObservabilityEvent[];
  recent: ObservabilityEvent[];
}

export function useDatabase(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.database(filters),
    queryFn: () =>
      apiGet<{ data: DatabaseResponse }>('/admin/observability/database', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export function useAuditTrail(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.auditTrail(filters),
    queryFn: () =>
      apiGet<{ data: { recent: ObservabilityEvent[] } }>('/admin/observability/audit-trail', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data.recent,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export interface ChangesResponse {
  recent: ObservabilityEvent[];
  integrity_snapshots: Array<Record<string, unknown>>;
}

export function useChanges(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.changes(filters),
    queryFn: () =>
      apiGet<{ data: ChangesResponse }>('/admin/observability/changes', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export function useObservabilityEventDetail(
  eventId: number | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: observabilityKeys.eventDetail(eventId),
    queryFn: () =>
      apiGet<{ data: ObservabilityEventDetail }>(`/admin/observability/events/${eventId}`),
    select: (res) => res.data,
    enabled: enabled && eventId != null,
  });
}
