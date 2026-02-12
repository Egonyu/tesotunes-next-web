import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export type SubscriptionPlanType = 'free' | 'premium' | 'artist';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: SubscriptionPlanType;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_playlists?: number;
  max_uploads?: number;
  audio_quality: string;
  offline_downloads: boolean;
  ad_free: boolean;
  lyrics: boolean;
  analytics: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  trial_ends_at?: string;
  payment_method?: 'wallet' | 'mtn_momo' | 'airtel_money' | 'card';
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUsage {
  playlists_created: number;
  playlists_limit: number;
  uploads_count: number;
  uploads_limit: number;
  downloads_count: number;
  downloads_limit: number;
}

export interface SubscribeRequest {
  plan_id: number;
  billing_cycle: BillingCycle;
  payment_method: 'wallet' | 'mtn_momo' | 'airtel_money' | 'card';
  phone?: string;
  auto_renew?: boolean;
}

export interface SubscribeResponse {
    subscription: Subscription;
  payment_reference?: string;
  message: string;
}

export interface UpdateSubscriptionRequest {
  plan_id?: number;
  billing_cycle?: BillingCycle;
  auto_renew?: boolean;
}

export interface CancelSubscriptionRequest {
  reason?: string;
  cancel_immediately?: boolean;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface Invoice {
  id: number;
  subscription_id: number;
  invoice_number: string;
  amount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  items: InvoiceItem[];
  issued_at: string;
  due_at: string;
  paid_at?: string;
  created_at: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============================================================================
// Subscription Plans Hooks
// ============================================================================

export function useSubscriptionPlans(options?: UseQueryOptions<SubscriptionPlan[]>) {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: () => apiGet<SubscriptionPlan[]>("/api/subscriptions/plans"),
    ...options,
  });
}

export function useSubscriptionPlan(planId: number | string) {
  return useQuery({
    queryKey: ["subscription", "plan", planId],
    queryFn: () => apiGet<{ data: SubscriptionPlan }>(`/api/subscriptions/plans/${planId}`).then(res => res.data),
    enabled: !!planId,
  });
}

// ============================================================================
// User Subscription Hooks
// ============================================================================

export function useMySubscription(options?: UseQueryOptions<Subscription | null>) {
  return useQuery({
    queryKey: ["subscription", "my"],
    queryFn: () => apiGet<{ data: Subscription | null }>("/api/subscriptions/my").then(res => res.data),
    ...options,
  });
}

export function useSubscriptionUsage() {
  return useQuery({
    queryKey: ["subscription", "usage"],
    queryFn: () => apiGet<{ data: SubscriptionUsage }>("/api/subscriptions/usage").then(res => res.data),
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubscribeRequest) =>
      apiPost<SubscribeResponse>("/api/subscriptions/subscribe", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "my"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubscriptionRequest) =>
      apiPut<Subscription>("/api/subscriptions/my", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "my"] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelSubscriptionRequest) =>
      apiPost<{ subscription: Subscription; message: string }>("/api/subscriptions/my/cancel", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "my"] });
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<Subscription>("/api/subscriptions/my/reactivate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "my"] });
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { payment_method: string; phone?: string }) =>
      apiPost<SubscribeResponse>("/api/subscriptions/my/renew", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "my"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// ============================================================================
// Invoice Hooks
// ============================================================================

export function useInvoices(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["subscription", "invoices", params],
    queryFn: () => apiGet<InvoicesResponse>("/api/subscriptions/invoices", { params }),
  });
}

export function useInvoice(invoiceId: number | string) {
  return useQuery({
    queryKey: ["subscription", "invoice", invoiceId],
    queryFn: () => apiGet<{ data: Invoice }>(`/api/subscriptions/invoices/${invoiceId}`).then(res => res.data),
    enabled: !!invoiceId,
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiGet(`/api/subscriptions/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response as unknown as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      return { success: true };
    },
  });
}

// ============================================================================
// Subscription Benefits Hook
// ============================================================================

export function useCanAccess(feature: string) {
  const { data: subscription } = useMySubscription();
  
  // Define feature access by plan
  const planFeatures: Record<SubscriptionPlanType, string[]> = {
    free: ['stream_with_ads', 'create_5_playlists', 'basic_quality'],
    premium: ['ad_free', 'unlimited_playlists', 'high_quality', 'offline_downloads', 'lyrics'],
    artist: ['everything_premium', 'unlimited_uploads', 'analytics', 'distribution', 'verified_badge'],
  };
  
  if (!subscription || subscription.status !== 'active') {
    return planFeatures.free.includes(feature);
  }
  
  return planFeatures[subscription.plan.slug]?.includes(feature) || false;
}

// ============================================================================
// Subscription Comparison Helper
// ============================================================================

export function useSubscriptionComparison() {
  const { data: plans } = useSubscriptionPlans();
  const { data: currentSubscription } = useMySubscription();
  
  return {
    plans: plans || [],
    currentPlan: currentSubscription?.plan,
    canUpgrade: (planId: number) => {
      if (!currentSubscription) return true;
      const targetPlan = plans?.find(p => p.id === planId);
      if (!targetPlan) return false;
      
      // Define plan hierarchy
      const hierarchy: Record<SubscriptionPlanType, number> = {
        free: 0,
        premium: 1,
        artist: 2,
      };
      
      return hierarchy[targetPlan.slug] > hierarchy[currentSubscription.plan.slug];
    },
    canDowngrade: (planId: number) => {
      if (!currentSubscription) return false;
      const targetPlan = plans?.find(p => p.id === planId);
      if (!targetPlan) return false;
      
      // Define plan hierarchy
      const hierarchy: Record<SubscriptionPlanType, number> = {
        free: 0,
        premium: 1,
        artist: 2,
      };
      
      return hierarchy[targetPlan.slug] < hierarchy[currentSubscription.plan.slug];
    },
  };
}
