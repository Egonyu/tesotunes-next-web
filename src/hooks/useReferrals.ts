import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface ReferralStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  churned: number;
  total_credits_earned: number;
}

export interface ReferralUser {
  name: string;
  avatar: string | null;
}

export interface RecentReferral {
  id: string;
  user: ReferralUser;
  status: 'pending' | 'active' | 'completed' | 'churned';
  joined_at: string;
  credits_earned: number;
}

export interface NextMilestone {
  name: string;
  referrals_required: number;
  current_count: number;
  progress: number;
  reward_type: string;
  reward_value: number;
}

export interface ReferralDashboard {
  referral_code: string;
  referral_link: string;
  stats: ReferralStats;
  recent_referrals: RecentReferral[];
  claimable_rewards: number;
  next_milestone: NextMilestone | null;
}

export interface ReferralHistoryItem {
  id: string;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  status: 'pending' | 'active' | 'completed' | 'churned';
  active_days: number;
  last_active_at: string | null;
  credits_earned: number;
  joined_at: string;
  subscription_tier?: string;
}

export interface ReferralMilestone {
  id: number;
  name: string;
  description: string;
  referrals_required: number;
  reward_type: 'credits' | 'badge' | 'ticket' | 'subscription' | 'merch' | 'vip';
  reward_value: number;
  badge_name: string;
  badge_icon: string;
  badge_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  status: 'locked' | 'earned' | 'claimable' | 'claimed';
  earned_at: string | null;
  claimed_at: string | null;
  progress: number;
}

export interface EarnedBadge {
  id: number;
  name: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  earned_at: string;
}

export interface RewardsData {
  milestones: ReferralMilestone[];
  badges: EarnedBadge[];
  current_referrals: number;
  total_credits_from_milestones: number;
  stats: {
    total_credits_earned: number;
    earned_rewards: number;
    claimable_rewards: number;
    current_referrals: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  username: string;
  avatar: string | null;
  referrals: number;
  credits_earned: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  movement?: 'up' | 'down' | 'same';
  movement_value?: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  current_user: {
    rank: number;
    user_id: number;
    name: string;
    referrals: number;
    credits_earned: number;
    tier: string;
    movement?: 'up' | 'down' | 'same';
    movement_value?: number;
  } | null;
  user_position: {
    rank: number;
    referrals: number;
    credits_earned: number;
    tier: string;
  } | null;
  period: string;
}

export interface ReferralCodeData {
  code: string;
  link: string;
  total_uses: number;
  successful_referrals: number;
  total_credits_earned: number;
}

export interface CodeValidation {
  valid: boolean;
  referrer: {
    name: string;
    avatar: string | null;
    is_artist: boolean;
  };
  bonus_credits: number;
}

// ============================================================================
// Dashboard Hook
// ============================================================================

export function useReferralDashboard() {
  return useQuery({
    queryKey: ["referrals", "dashboard"],
    queryFn: () => apiGet<{ data: ReferralDashboard }>("/api/referrals/dashboard")
      .then(res => res.data),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// Referral Code Hook
// ============================================================================

export function useReferralCode() {
  return useQuery({
    queryKey: ["referrals", "code"],
    queryFn: () => apiGet<{ data: ReferralCodeData }>("/api/referrals/code")
      .then(res => res.data),
  });
}

// ============================================================================
// Referral History Hook
// ============================================================================

export interface ReferralHistoryResponse {
  referrals: ReferralHistoryItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    churned: number;
    total_credits: number;
  };
}

export function useReferralHistory(
  status?: string, 
  page: number = 1, 
  perPage: number = 10, 
  search?: string
) {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (status) params.status = status;
  if (search) params.search = search;

  return useQuery({
    queryKey: ["referrals", "history", status, page, perPage, search],
    queryFn: () => apiGet<ReferralHistoryResponse>("/api/referrals/history", { params }),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Rewards Hook
// ============================================================================

export function useReferralRewards() {
  return useQuery({
    queryKey: ["referrals", "rewards"],
    queryFn: () => apiGet<{ data: RewardsData }>("/api/referrals/rewards")
      .then(res => res.data),
  });
}

// ============================================================================
// Claim Reward Mutation
// ============================================================================

export function useClaimReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (milestoneId: number) => 
      apiPost<{ message: string }>(`/api/referrals/rewards/${milestoneId}/claim`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals", "rewards"] });
      queryClient.invalidateQueries({ queryKey: ["referrals", "dashboard"] });
    },
  });
}

// ============================================================================
// Leaderboard Hook
// ============================================================================

export function useReferralLeaderboard(period: 'week' | 'weekly' | 'month' | 'monthly' | 'all_time' = 'all_time', limit = 10) {
  // Normalize period names
  const normalizedPeriod = period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : period;
  
  return useQuery({
    queryKey: ["referrals", "leaderboard", normalizedPeriod, limit],
    queryFn: () => apiGet<{ data: LeaderboardData }>("/api/referrals/leaderboard", {
      params: { period: normalizedPeriod, limit },
    }).then(res => res.data),
    staleTime: 60 * 1000, // 1 minute
  });
}

// ============================================================================
// Validate Code Hook (for join page)
// ============================================================================

export function useValidateReferralCode(code: string) {
  return useQuery({
    queryKey: ["referrals", "validate", code],
    queryFn: () => apiGet<{ data: CodeValidation }>(`/api/referrals/validate/${code}`)
      .then(res => res.data),
    enabled: !!code,
    retry: false,
  });
}

// ============================================================================
// Track Share Mutation
// ============================================================================

export function useTrackShare() {
  return useMutation({
    mutationFn: (platform: 'whatsapp' | 'twitter' | 'facebook' | 'sms' | 'email' | 'copy' | 'qr') =>
      apiPost<void>("/api/referrals/share", { platform }),
  });
}

// ============================================================================
// Campaign Referrals Types
// ============================================================================

export interface EventReferral {
  id: number;
  event: {
    id: number;
    title: string;
    image: string | null;
    date: string;
    venue: string;
  };
  referral_link: string;
  referral_code: string;
  stats: {
    total_referred: number;
    tickets_sold: number;
    revenue_generated: number;
    free_tickets_earned: number;
  };
  reward_rule: string;
  status: 'active' | 'expired' | 'completed';
  expires_at: string;
}

export interface CampaignReferralStats {
  total_campaigns: number;
  active_campaigns: number;
  total_referred: number;
  total_conversions: number;
  conversion_rate: number;
  total_revenue: number;
}

export interface ReferralCampaign {
  id: number;
  name: string;
  description: string;
  type: 'event' | 'signup' | 'store' | 'subscription';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'expired';
  start_date: string;
  end_date: string;
  reward_type: 'credits' | 'ticket' | 'discount' | 'badge';
  reward_value: number;
  reward_description: string;
  referral_required: number;
  image: string | null;
  stats: {
    total_participants: number;
    total_referrals: number;
    total_conversions: number;
    total_rewards_claimed: number;
    conversion_rate: number;
  };
  created_at: string;
}

export interface ReferralCampaignDetail extends ReferralCampaign {
  participants: Array<{
    user_id: number;
    name: string;
    avatar: string | null;
    referrals: number;
    conversions: number;
    rewards_earned: number;
    joined_at: string;
  }>;
  conversion_chart: Array<{ date: string; referrals: number; conversions: number }>;
}

export interface ConversionAnalytics {
  overview: {
    total_campaigns: number;
    total_referrals: number;
    total_conversions: number;
    overall_conversion_rate: number;
    total_revenue: number;
    total_rewards_distributed: number;
  };
  by_campaign_type: Array<{
    type: string;
    campaigns: number;
    referrals: number;
    conversions: number;
    conversion_rate: number;
    revenue: number;
  }>;
  by_period: Array<{
    period: string;
    referrals: number;
    conversions: number;
    revenue: number;
  }>;
  top_campaigns: Array<{
    id: number;
    name: string;
    type: string;
    referrals: number;
    conversions: number;
    conversion_rate: number;
    revenue: number;
  }>;
  top_referrers: Array<{
    user_id: number;
    name: string;
    avatar: string | null;
    total_referrals: number;
    total_conversions: number;
    total_revenue: number;
  }>;
}

// ============================================================================
// Event Referrals Hooks
// ============================================================================

export function useEventReferrals(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ["referrals", "events", params],
    queryFn: () => apiGet<{
            data: EventReferral[];
      pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>("/api/referrals/events", { params }),
    staleTime: 30 * 1000,
  });
}

export function useEventReferralLink(eventId: number) {
  return useQuery({
    queryKey: ["referrals", "events", eventId, "link"],
    queryFn: () => apiGet<{ data: EventReferral }>(`/api/referrals/events/${eventId}/link`)
      .then(res => res.data),
    enabled: !!eventId,
  });
}

export function useCreateEventReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) =>
      apiPost<{ data: EventReferral }>(`/api/referrals/events/${eventId}/create`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals", "events"] });
    },
  });
}

// ============================================================================
// Campaign Tracking Hooks (Admin)
// ============================================================================

export function useCampaignReferralStats() {
  return useQuery({
    queryKey: ["admin", "campaigns", "referral-stats"],
    queryFn: () => apiGet<{ data: CampaignReferralStats }>("/api/admin/referrals/campaigns/stats")
      .then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useReferralCampaigns(params?: {
  type?: string;
  status?: string;
  page?: number;
  per_page?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin", "campaigns", params],
    queryFn: () => apiGet<{
            data: ReferralCampaign[];
      pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>("/api/admin/referrals/campaigns", { params }),
    staleTime: 30 * 1000,
  });
}

export function useCampaignDetail(id: number) {
  return useQuery({
    queryKey: ["admin", "campaigns", id],
    queryFn: () => apiGet<{ data: ReferralCampaignDetail }>(`/api/admin/referrals/campaigns/${id}`)
      .then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateReferralCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      type: 'event' | 'signup' | 'store' | 'subscription';
      start_date: string;
      end_date: string;
      reward_type: 'credits' | 'ticket' | 'discount' | 'badge';
      reward_value: number;
      reward_description: string;
      referral_required: number;
    }) => apiPost<{ data: ReferralCampaign }>("/api/admin/referrals/campaigns", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
    },
  });
}

export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'paused' | 'completed' }) =>
      apiPost<void>(`/api/admin/referrals/campaigns/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
    },
  });
}

// ============================================================================
// Conversion Analytics Hook (Admin)
// ============================================================================

export function useConversionAnalytics(period?: string) {
  return useQuery({
    queryKey: ["admin", "referrals", "analytics", period],
    queryFn: () => apiGet<{ data: ConversionAnalytics }>("/api/admin/referrals/analytics", {
      params: period ? { period } : undefined,
    }).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Special Referral Campaigns (User-facing)
// ============================================================================

export interface SpecialCampaign {
  id: number;
  name: string;
  description: string;
  type: 'double_points' | 'bonus_credits' | 'exclusive_badge' | 'premium_trial';
  multiplier: number; // e.g., 2 for 2x points
  bonus_credits: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants_count: number;
  max_participants?: number;
  requirements?: string;
  reward_description: string;
  banner_url?: string;
  has_joined?: boolean;
}

export function useActiveSpecialCampaigns() {
  return useQuery({
    queryKey: ["referrals", "special-campaigns"],
    queryFn: () => apiGet<{ data: SpecialCampaign[] }>("/api/referrals/special-campaigns").then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useJoinSpecialCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: number) =>
      apiPost(`/api/referrals/special-campaigns/${campaignId}/join`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals", "special-campaigns"] });
    },
  });
}
