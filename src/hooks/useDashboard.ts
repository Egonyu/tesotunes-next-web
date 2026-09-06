import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

// ============================================================================
// Unified account dashboard — matches App\Services\Dashboard\DashboardService
// ============================================================================

interface Money {
  ugx: number;
  credits: number;
}

/** Capability grants that gate which dashboard modules render. */
export type Capability =
  | 'artist'
  | 'seller'
  | 'organizer'
  | 'promoter'
  | 'label'
  | 'contributor';

export interface DashboardNextAction {
  key: string;
  label: string;
  why: string;
  importance: 'high' | 'medium' | 'low';
  route: string | null;
}

export interface DashboardContributions {
  tier: string;
  submissions_total: number;
  submissions_accepted: number;
  validations_total: number;
  credits_earned_total: number;
  /** Tier follows the gold-task pass rate, not submission volume. */
  gold_attempts: number;
  gold_pass_rate: number;
  gold_attempts_required: number;
  trusted_min_pass_rate: number;
}

export interface DashboardArtist {
  stage_name: string;
  slug: string;
  is_verified: boolean;
  total_plays: number;
  followers: number;
  songs_published: number;
  songs_pending_review: number;
  songs_draft: number;
}

export interface DashboardDailyBonus {
  available: boolean;
  credits: number;
  available_in_minutes: number;
  streak_days: number;
}

export interface DashboardOverview {
  wallet: {
    ugx_balance: number;
    credits_balance: number;
    credits_earned_today: number;
  };
  earnings: { pending: Money; available: Money; paid_out: Money };
  listening: {
    plays_total: number;
    plays_30d: number;
    plays_previous_30d: number;
    minutes_30d: number;
    completed_30d: number;
    last_played_at: string | null;
  };
  profile: {
    completion_percentage: number;
    phone_verified: boolean;
    email_verified: boolean;
  };
  daily_bonus: DashboardDailyBonus | null;
  next_actions: DashboardNextAction[];
  capabilities: Capability[];
  contributions: DashboardContributions | null;
  artist: DashboardArtist | null;
  recent_activity: Array<{ type: string; label: string; at: string | null }>;
}

interface Wrapped<T> {
  success: boolean;
  data: T;
}

export function useDashboardOverview(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => apiGet<Wrapped<DashboardOverview>>('/dashboard/overview').then((r) => r.data),
    enabled,
    staleTime: 30 * 1000,
  });
}

/** Claims the daily login bonus, then refreshes the dashboard showing it. */
export function useClaimDailyBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<{ success: boolean; message: string }>('/credits/claim-daily-bonus'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });
}
