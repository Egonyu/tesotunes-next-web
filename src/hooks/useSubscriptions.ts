import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useSession } from "next-auth/react";

// ============================================================================
// Types — aligned with backend SubscriptionController responses
// ============================================================================

export type SubscriptionPlanSlug = 'free' | 'premium' | 'artist' | 'label';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending_renewal';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: SubscriptionPlanSlug;
  description: string;
  tier: string;
  type: string;
  price: number;
  price_monthly: number;
  price_yearly: number;
  price_local: number;
  currency: string;
  trial_days: number;
  features: string[];
  limits: {
    downloads_per_day: number | null;
    uploads_per_month: number | null;
    audio_quality_kbps: number;
  };
  has_ads: boolean;
  offline_mode: boolean;
  is_featured: boolean;
  is_popular: boolean;
}

export interface CurrentSubscription {
  has_subscription: boolean;
  subscription_id?: number;
  plan: string;
  plan_name?: string;
  tier?: string;
  status?: SubscriptionStatus;
  started_at?: string;
  expires_at?: string;
  days_remaining?: number;
  auto_renew?: boolean;
  ad_free?: boolean;
  offline_access?: boolean;
  limits: {
    downloads_per_day: number;
    downloads_today: number;
    audio_quality_kbps: number;
    uploads_per_month: number;
    uploads_this_month: number;
  };
}

export interface SubscribeRequest {
  plan_id: number;
  payment_method: 'mobile_money' | 'card';
  phone_number: string;
  billing_period?: BillingCycle;
}

export interface SubscribeResponse {
  success: boolean;
  payment_id?: number;
  subscription_id?: number;
  message: string;
  payment_status?: string;
  subscription_ends_at?: string;
}

export interface ChangePlanRequest {
  plan_id: number;
  payment_method: 'mobile_money' | 'card';
  phone_number: string;
}

export interface ChangePlanResponse {
  success: boolean;
  message: string;
  data?: {
    direction: 'upgrade' | 'downgrade';
    new_plan: string;
    pro_rata_credit: number;
    amount_charged: number;
  };
}

export interface SubscriptionHistoryEntry {
  id: number;
  plan: {
    name: string;
    slug: string;
    tier: string;
  };
  status: string;
  amount_paid: number;
  currency: string;
  payment_method: string;
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  auto_renew: boolean;
  created_at: string;
}

// ============================================================================
// Subscription Plans — GET /subscription-plans (public)
// ============================================================================

export function useSubscriptionPlans(options?: Partial<UseQueryOptions<SubscriptionPlan[]>>) {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: () =>
      apiGet<{ success: boolean; data: SubscriptionPlan[] }>("/subscription-plans").then(
        (res) => res.data
      ),
    staleTime: 5 * 60 * 1000, // Plans rarely change
    ...options,
  });
}

// ============================================================================
// Current Subscription — GET /user/subscription (auth)
// ============================================================================

export function useMySubscription(options?: Partial<UseQueryOptions<CurrentSubscription | null>>) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const enabled = isAuthenticated && (options?.enabled ?? true);

  return useQuery({
    ...options,
    queryKey: ["subscription", "current"],
    queryFn: () =>
      apiGet<{ success: boolean; data: CurrentSubscription }>("/user/subscription").then(
        (res) => res.data
      ),
    enabled,
    retry: false,
  });
}

// ============================================================================
// Subscription History — GET /user/subscription/history (auth)
// ============================================================================

export function useSubscriptionHistory(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["subscription", "history", params],
    queryFn: () =>
      apiGet<{ success: boolean; data: SubscriptionHistoryEntry[]; meta?: Record<string, unknown> }>(
        "/user/subscription/history",
        { params }
      ).then((res) => res.data),
  });
}

// ============================================================================
// Subscribe — POST /subscriptions/subscribe (auth)
// ============================================================================

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubscribeRequest) =>
      apiPost<SubscribeResponse>("/subscriptions/subscribe", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

// ============================================================================
// Change Plan — POST /subscriptions/change-plan (auth)
// ============================================================================

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePlanRequest) =>
      apiPost<ChangePlanResponse>("/subscriptions/change-plan", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

// ============================================================================
// Toggle Auto-Renew — POST /subscriptions/toggle-auto-renew (auth)
// ============================================================================

export function useToggleAutoRenew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<{ success: boolean; data: { auto_renew: boolean }; message: string }>(
        "/subscriptions/toggle-auto-renew"
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
    },
  });
}

// ============================================================================
// Cancel — POST /subscriptions/{id}/cancel (auth)
// ============================================================================

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: number; reason?: string }) =>
      apiPost<{ success: boolean; message: string }>(
        `/subscriptions/${subscriptionId}/cancel`,
        { reason }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

// ============================================================================
// Poll Payment Status — GET /payments/{id}/status (auth)
// For async ZengaPay payments: poll until completed/failed
// ============================================================================

export function useSubscriptionPaymentStatus(paymentId: number | null) {
  return useQuery({
    queryKey: ["payment", "status", paymentId],
    queryFn: () =>
      apiGet<{ success: boolean; data: { status: string; message?: string } }>(
        `/payments/status/${paymentId}`
      ).then((res) => res.data),
    enabled: !!paymentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling once finalized
      if (status === "completed" || status === "failed" || status === "cancelled") {
        return false;
      }
      return 5000; // Poll every 5 seconds
    },
  });
}

// ============================================================================
// useCanAccess — check if current subscription grants a named feature
// ============================================================================

type SubscriptionFeature = 'ad_free' | 'stream_with_ads' | 'offline_access' | 'high_quality' | string;

export function useCanAccess(feature: SubscriptionFeature): boolean {
  const { data: sub } = useMySubscription();

  switch (feature) {
    case 'ad_free':
      return sub?.ad_free === true;
    case 'stream_with_ads':
      // Free-tier users stream with ads (i.e. they do NOT have ad_free)
      return !sub?.ad_free;
    case 'offline_access':
      return sub?.offline_access === true;
    case 'high_quality':
      return (sub?.limits?.audio_quality_kbps ?? 0) >= 320;
    default:
      return false;
  }
}
