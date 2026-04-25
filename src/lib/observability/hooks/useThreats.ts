'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type {
  AttackerDetail,
  AttackerRow,
  EntryPointRow,
  ObservabilityEvent,
  ObservabilityFilters,
} from '@/types/observability';
import { observabilityKeys } from '../keys';
import { paramsFromFilters } from '../params';

export function useThreatEvents(filters: ObservabilityFilters, perPage = 25) {
  return useQuery({
    queryKey: observabilityKeys.events(filters),
    queryFn: () =>
      apiGet<{ data: ObservabilityEvent[]; meta: { total: number } }>(
        '/admin/observability/events',
        { params: paramsFromFilters(filters, { per_page: perPage }) },
      ),
    select: (res) => ({ rows: res.data, total: res.meta?.total ?? res.data.length }),
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
}

export function useEntryPoints(filters: ObservabilityFilters) {
  return useQuery({
    queryKey: observabilityKeys.entryPoints(filters),
    queryFn: () =>
      apiGet<{ data: EntryPointRow[] }>('/admin/observability/entry-points', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export function useAttackers(filters: ObservabilityFilters) {
  return useQuery({
    queryKey: observabilityKeys.attackers(filters),
    queryFn: () =>
      apiGet<{ data: AttackerRow[] }>('/admin/observability/attackers', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
}

export function useAttackerDetail(id: string | number | null | undefined) {
  return useQuery({
    queryKey: observabilityKeys.attackerDetail(id),
    queryFn: () => apiGet<{ data: AttackerDetail }>(`/admin/observability/attackers/${id}`),
    select: (res) => res.data,
    enabled: id != null,
  });
}

export interface BotsResponse {
  summary: Record<string, number>;
  top_bots: Array<{ ip: string; events: number; risk_score: number }>;
}

export function useBots(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.bots(filters),
    queryFn: () =>
      apiGet<{ data: BotsResponse }>('/admin/observability/bots', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}
