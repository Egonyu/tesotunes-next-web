'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type {
  IntegrationProviderRow,
  ObservabilityEvent,
  ObservabilityFilters,
  PaymentRiskDetail,
  SessionDetail,
  StakeholderDetail,
  StakeholderRiskRow,
} from '@/types/observability';
import { observabilityKeys } from '../keys';
import { paramsFromFilters } from '../params';

export interface AuthSessionsResponse {
  summary: Record<string, number>;
  recent: ObservabilityEvent[];
}

export function useAuthSessions(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.authSessions(filters),
    queryFn: () =>
      apiGet<{ data: AuthSessionsResponse }>('/admin/observability/auth-sessions', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export function useSessionDetail(sessionId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.sessionDetail(sessionId),
    queryFn: () => apiGet<{ data: SessionDetail }>(`/admin/observability/auth-sessions/${sessionId}`),
    select: (res) => res.data,
    enabled: enabled && !!sessionId,
  });
}

export interface PaymentsRiskResponse {
  dashboard: { summary: Record<string, number> };
  high_risk_events: ObservabilityEvent[];
}

export function usePaymentsRisk(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.paymentsRisk(filters),
    queryFn: () =>
      apiGet<{ data: PaymentsRiskResponse }>('/admin/observability/payments-risk', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export function usePaymentRiskDetail(reference: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.paymentsRiskDetail(reference),
    queryFn: () =>
      apiGet<{ data: PaymentRiskDetail }>(`/admin/observability/payments-risk/${reference}`),
    select: (res) => res.data,
    enabled: enabled && !!reference,
  });
}

export interface StakeholderRiskResponse {
  summary: Record<string, number>;
  actors: StakeholderRiskRow[];
}

export function useStakeholderRisk(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.stakeholderRisk(filters),
    queryFn: () =>
      apiGet<{ data: StakeholderRiskResponse }>('/admin/observability/stakeholder-risk', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}

export function useStakeholderDetail(
  actorType: string | null | undefined,
  actorId: string | number | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: observabilityKeys.stakeholderDetail(actorType, actorId),
    queryFn: () =>
      apiGet<{ data: StakeholderDetail }>(
        `/admin/observability/stakeholder-risk/${actorType}/${actorId}`,
      ),
    select: (res) => res.data,
    enabled: enabled && !!actorType && actorId != null,
  });
}

export interface IntegrationsResponse {
  summary: Record<string, number>;
  providers: IntegrationProviderRow[];
  recent: ObservabilityEvent[];
}

export function useIntegrations(filters: ObservabilityFilters, enabled = true) {
  return useQuery({
    queryKey: observabilityKeys.integrations(filters),
    queryFn: () =>
      apiGet<{ data: IntegrationsResponse }>('/admin/observability/integrations', {
        params: paramsFromFilters(filters),
      }),
    select: (res) => res.data,
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
    enabled,
  });
}
