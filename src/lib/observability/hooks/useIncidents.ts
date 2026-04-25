'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import type {
  IncidentDetail,
  IncidentRow,
  IncidentSuggestionRow,
  ObservabilityFilters,
} from '@/types/observability';
import { observabilityKeys } from '../keys';
import { paramsFromFilters } from '../params';

export function useIncidents(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.incidents(filters),
    queryFn: () =>
      apiGet<{ data: IncidentRow[] }>('/admin/observability/incidents', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export function useIncidentDetail(id: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.incidentDetail(id),
    queryFn: () => apiGet<{ data: IncidentDetail }>(`/admin/observability/incidents/${id}`),
    select: (res) => res.data,
    enabled: enabled && id != null,
  });
}

export function useIncidentSuggestions(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.incidentSuggestions(filters),
    queryFn: () =>
      apiGet<{ data: IncidentSuggestionRow[] }>('/admin/observability/incidents/suggestions', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

/* ---------------------------------------------------------------------- mutations */

interface CreateIncidentPayload {
  title: string;
  severity: string;
  summary?: string;
  notes?: string;
  event_ids: number[];
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncidentPayload) =>
      apiPost<{ data: IncidentRow }>('/admin/observability/incidents', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incidents'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incident-suggestions'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'overview'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incident-detail'] });
    },
  });
}

interface UpdateIncidentPayload {
  status?: string;
  severity?: string;
  notes?: string;
  append_note?: string;
  event_ids?: number[];
}

export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, payload }: { incidentId: number; payload: UpdateIncidentPayload }) =>
      apiPatch<{ data: IncidentRow }>(`/admin/observability/incidents/${incidentId}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incidents'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incident-suggestions'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incident-detail'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'overview'] });
    },
  });
}

export function useAssignIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: number) =>
      apiPatch<{ data: IncidentRow }>(`/admin/observability/incidents/${incidentId}/assign`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incidents'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incident-detail'] });
    },
  });
}

export function useReleaseIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: number) =>
      apiPatch<{ data: IncidentRow }>(`/admin/observability/incidents/${incidentId}/release`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incidents'] });
      qc.invalidateQueries({ queryKey: [...observabilityKeys.all, 'incident-detail'] });
    },
  });
}
