import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface LoyaltyClub {
  id: number;
  artist_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  member_count: number;
  artist?: {
    id: number;
    name: string;
    avatar: string | null;
    is_verified: boolean;
  };
}

export interface LoyaltyCard {
  id: number;
  club_id: number;
  member_id: number;
  unique_identifier: string;
  points_balance: number;
  tier: string;
  joined_at: string;
  last_activity_at: string | null;
  club: LoyaltyClub;
}

export interface LoyaltyReward {
  id: number;
  club_id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  points_required: number;
  quantity_available: number | null;
  is_active: boolean;
  expires_at: string | null;
  reward_type: 'digital' | 'physical' | 'experience' | 'discount';
}

export interface LoyaltyTransaction {
  id: number;
  card_id: number;
  type: 'earn' | 'redeem' | 'bonus' | 'expired' | 'adjustment';
  points: number;
  description: string;
  reference_type: string | null;
  reference_id: number | null;
  created_at: string;
}

export interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  benefits: string[];
  color: string;
}

export interface LoyaltyBadge {
  id: number;
  name: string;
  description: string;
  icon_url: string | null;
  earned_at?: string;
}

export interface EarningActivity {
  id: number;
  action: string;
  description: string;
  points: number;
}

// ============================================================================
// User Loyalty Hooks
// ============================================================================

/** Get membership summary (total clubs, points, tier) */
export function useLoyaltyMembership() {
  return useQuery({
    queryKey: ["loyalty", "membership"],
    queryFn: () => apiGet<{
      success: boolean;
      data: {
        member_id: number;
        total_clubs: number;
        total_points: number;
        tier: string;
      } | null;
    }>("/loyalty/memberships/summary").then(res => res.data),
    staleTime: 60 * 1000,
  });
}

/** Get user's loyalty memberships (cards) */
export function useMyLoyaltyCards() {
  return useQuery({
    queryKey: ["loyalty", "my-cards"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyCard[];
    }>("/loyalty/memberships").then(res => res.data),
    staleTime: 30 * 1000,
  });
}

/** Get single membership detail */
export function useLoyaltyCard(membershipId: number) {
  return useQuery({
    queryKey: ["loyalty", "memberships", membershipId],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyCard;
    }>(`/loyalty/memberships/${membershipId}`).then(res => res.data),
    enabled: !!membershipId,
  });
}

// ============================================================================
// Points & History Hooks
// ============================================================================

/** Get user's points balance */
export function useLoyaltyPoints() {
  return useQuery({
    queryKey: ["loyalty", "points"],
    queryFn: () => apiGet<{
      success: boolean;
      data: { balance: number; lifetime_earned: number; lifetime_spent: number };
    }>("/loyalty/points").then(res => res.data),
    staleTime: 30 * 1000,
  });
}

/** Get points transaction history */
export function useLoyaltyPointsHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["loyalty", "points-history", params],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyTransaction[];
      pagination: { current_page: number; last_page: number; total: number };
    }>("/loyalty/points/history", { params }),
    staleTime: 30 * 1000,
  });
}

/** Get earning activities (ways to earn points) */
export function useLoyaltyEarningActivities() {
  return useQuery({
    queryKey: ["loyalty", "earning-activities"],
    queryFn: () => apiGet<{
      success: boolean;
      data: EarningActivity[];
    }>("/loyalty/points/earning-activities").then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Club Discovery Hooks
// ============================================================================

export function useLoyaltyClubs(params?: {
  search?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ["loyalty", "fan-clubs", params],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyClub[];
      pagination: { current_page: number; last_page: number; total: number };
    }>("/loyalty/fan-clubs", { params }),
    staleTime: 60 * 1000,
  });
}

/** Get club by slug - uses dedicated slug endpoint */
export function useLoyaltyClubBySlug(slug: string) {
  return useQuery({
    queryKey: ["loyalty", "fan-clubs", "slug", slug],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyClub;
    }>(`/loyalty/fan-clubs/slug/${slug}`).then(res => res.data),
    enabled: !!slug,
  });
}

/** Get club by ID */
export function useLoyaltyClub(id: number) {
  return useQuery({
    queryKey: ["loyalty", "fan-clubs", id],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyClub;
    }>(`/loyalty/fan-clubs/${id}`).then(res => res.data),
    enabled: !!id,
  });
}

/** Get club tiers */
export function useLoyaltyClubTiers(clubId: number) {
  return useQuery({
    queryKey: ["loyalty", "fan-clubs", clubId, "tiers"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyTier[];
    }>(`/loyalty/fan-clubs/${clubId}/tiers`).then(res => res.data),
    enabled: !!clubId,
  });
}

export function useFeaturedLoyaltyClubs() {
  return useQuery({
    queryKey: ["loyalty", "featured-clubs"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyClub[];
    }>("/loyalty/fan-clubs/featured").then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Rewards Hooks
// ============================================================================

export function useLoyaltyRewards(clubId?: number) {
  return useQuery({
    queryKey: ["loyalty", "rewards", clubId],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyReward[];
    }>(`/loyalty/fan-clubs/${clubId}/rewards`).then(res => res.data),
    enabled: !!clubId,
    staleTime: 60 * 1000,
  });
}

/** Get all available rewards */
export function useAllLoyaltyRewards() {
  return useQuery({
    queryKey: ["loyalty", "rewards"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyReward[];
    }>("/loyalty/rewards").then(res => res.data),
    staleTime: 60 * 1000,
  });
}

/** Get user's redeemed rewards */
export function useRedeemedRewards() {
  return useQuery({
    queryKey: ["loyalty", "rewards", "redeemed"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyReward[];
    }>("/loyalty/rewards/redeemed").then(res => res.data),
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { reward_id: number }) =>
      apiPost<{
        success: boolean;
        message: string;
        data: { redemption_code: string };
      }>(`/loyalty/rewards/${data.reward_id}/redeem`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] });
    },
  });
}

// ============================================================================
// Join/Leave Club Hooks
// ============================================================================

export function useJoinLoyaltyClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) =>
      apiPost<{
        success: boolean;
        message: string;
        data: LoyaltyCard;
      }>(`/loyalty/fan-clubs/${clubId}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] });
    },
  });
}

export function useLeaveLoyaltyClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) =>
      apiDelete<{ success: boolean; message: string }>(`/loyalty/fan-clubs/${clubId}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] });
    },
  });
}

// ============================================================================
// Badges & Achievements
// ============================================================================

export function useLoyaltyBadges() {
  return useQuery({
    queryKey: ["loyalty", "badges"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyBadge[];
    }>("/loyalty/badges").then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEarnedBadges() {
  return useQuery({
    queryKey: ["loyalty", "badges", "earned"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyBadge[];
    }>("/loyalty/badges/earned").then(res => res.data),
  });
}

// ============================================================================
// Leaderboards
// ============================================================================

export function useLoyaltyLeaderboard(clubId?: number) {
  return useQuery({
    queryKey: ["loyalty", "leaderboard", clubId],
    queryFn: () => apiGet<{
      success: boolean;
      data: Array<{
        rank: number;
        user: { id: number; name: string; avatar: string | null };
        points: number;
        tier: string;
      }>;
    }>(clubId ? `/loyalty/leaderboards/${clubId}` : "/loyalty/leaderboards/global").then(res => res.data),
    staleTime: 60 * 1000,
  });
}

// ============================================================================
// Artist Loyalty Card Management (for artists)
// ============================================================================

export function useArtistLoyaltyClub() {
  return useQuery({
    queryKey: ["loyalty", "artist-club"],
    queryFn: () => apiGet<{
      success: boolean;
      data: LoyaltyClub | null;
    }>("/artist/fan-clubs").then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useCreateArtistLoyaltyClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      logo?: File;
    }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.logo) formData.append('logo', data.logo);

      return apiPost<{
        success: boolean;
        message: string;
        data: LoyaltyClub;
      }>("/artist/fan-clubs", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", "artist-club"] });
    },
  });
}

export function useArtistLoyaltyMembers(clubId: number, params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ["loyalty", "artist-members", clubId, params],
    queryFn: () => apiGet<{
      success: boolean;
      data: Array<{
        id: number;
        user: { id: number; name: string; avatar: string | null };
        points_balance: number;
        tier: string;
        joined_at: string;
      }>;
      pagination: { current_page: number; last_page: number; total: number };
    }>(`/artist/fan-clubs/${clubId}/members`, { params }),
    enabled: !!clubId,
    staleTime: 30 * 1000,
  });
}

export function useCreateLoyaltyReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      club_id: number;
      title: string;
      description?: string;
      points_required: number;
      quantity_available?: number;
      reward_type: 'digital' | 'physical' | 'experience' | 'discount';
      expires_at?: string;
    }) => apiPost<{
      success: boolean;
      message: string;
      data: LoyaltyReward;
    }>(`/artist/fan-clubs/${data.club_id}/rewards`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", "artist-club"] });
    },
  });
}

// ============================================================================
// QR Code Hooks
// ============================================================================

export function useScanLoyaltyQR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { qr_code: string }) =>
      apiPost<{
        success: boolean;
        message: string;
        data: {
          points_earned: number;
          new_balance: number;
          event?: string;
        };
      }>("/loyalty/points/scan-qr", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] });
    },
  });
}
