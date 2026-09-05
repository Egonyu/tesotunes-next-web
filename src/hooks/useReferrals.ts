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
  /**
   * What the programme pays today, read from credit_rates on the server.
   * The page states these rather than hardcoding a figure, because the rate
   * is operator-editable and can sit inside a time-limited window.
   */
  reward_rates?: {
    referrer_credits: number;
    joiner_credits: number;
  };
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
    queryFn: () => apiGet<{ data: ReferralDashboard }>("/referrals/dashboard")
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
    queryFn: () => apiGet<{ data: ReferralCodeData }>("/referrals/code")
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
    queryFn: () => apiGet<ReferralHistoryResponse>("/referrals/history", { params }),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Rewards Hook
// ============================================================================

export function useReferralRewards() {
  return useQuery({
    queryKey: ["referrals", "rewards"],
    queryFn: () => apiGet<{ data: RewardsData }>("/referrals/rewards")
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
      apiPost<{ message: string }>(`/referrals/rewards/${milestoneId}/claim`),
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
    queryFn: () => apiGet<{ data: LeaderboardData }>("/referrals/leaderboard", {
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
    queryFn: () => apiGet<{ data: CodeValidation }>(`/referrals/validate/${code}`)
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
      apiPost<void>("/referrals/share", { platform }),
  });
}


// ============================================================================
// Removed surfaces
// ============================================================================
//
// Event referrals (/referrals/events/*) and special campaigns
// (/referrals/special-campaigns) were defined here against endpoints that
// have never existed, and no page mounted the event hooks at all.
//
// They were dropped rather than built because the platform already has the
// mechanism each was reaching for: a time-limited referral push is a window
// on the referral rate — credit_rates carries starts_at and ends_at, and
// RewardRuleService honours them — set from /admin/rewards. A second system
// for the same thing is how this codebase acquired two of everything else.
