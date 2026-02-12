import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface AwardSeason {
  id: number;
  name: string;
  slug: string;
  year: number;
  status: 'upcoming' | 'nominations_open' | 'voting_open' | 'closed' | 'completed';
  nominations_start: string;
  nominations_end: string;
  voting_start: string;
  voting_end: string;
  ceremony_date: string | null;
  cover_image_url: string | null;
  total_votes: number;
  categories_count: number;
}

export interface AwardCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  nominations: AwardNomination[];
}

export interface AwardNomination {
  id: number;
  nominee_name: string;
  nominee_type: 'artist' | 'song' | 'album';
  nominee_image_url: string | null;
  artist_name?: string;
  votes_count: number;
  vote_percentage: number;
  is_winner: boolean;
  has_voted: boolean;
}

export interface LeaderboardVoter {
  id: number;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
  total_votes: number;
  rank: number;
  badge?: 'gold' | 'silver' | 'bronze';
}

export interface AwardStats {
  total_votes: number;
  total_voters: number;
  total_categories: number;
  total_nominees: number;
  voting_ends_at: string | null;
}

// ============================================================================
// Fetch Hooks
// ============================================================================

export function useAwardSeasons(status?: string) {
  return useQuery({
    queryKey: ['awards', 'seasons', status],
    queryFn: () => {
      const params = status ? `?status=${status}` : '';
      return apiGet<{ data: AwardSeason[] }>(`/api/awards/seasons${params}`).then(res => res.data);
    },
    staleTime: 60 * 1000,
  });
}

export function useAwardSeason(slug: string) {
  return useQuery({
    queryKey: ['awards', 'season', slug],
    queryFn: () => apiGet<{ data: AwardSeason & { categories: AwardCategory[] } }>(`/api/awards/seasons/${slug}`).then(res => res.data),
    enabled: !!slug,
  });
}

export function useAwardLeaderboard(seasonSlug?: string, limit = 20) {
  return useQuery({
    queryKey: ['awards', 'leaderboard', seasonSlug, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (seasonSlug) params.append('season', seasonSlug);
      params.append('limit', String(limit));
      return apiGet<{ data: LeaderboardVoter[] }>(`/api/awards/leaderboard?${params.toString()}`).then(res => res.data);
    },
    staleTime: 30 * 1000,
  });
}

export function useAwardStats(seasonSlug?: string) {
  return useQuery({
    queryKey: ['awards', 'stats', seasonSlug],
    queryFn: () => apiGet<{ data: AwardStats }>(`/api/awards/stats${seasonSlug ? `?season=${seasonSlug}` : ''}`).then(res => res.data),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useVoteForNomination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seasonSlug, nominationId }: { seasonSlug: string; nominationId: number }) =>
      apiPost(`/api/awards/seasons/${seasonSlug}/vote`, { nomination_id: nominationId }),
    onSuccess: (_, variables) => {
      toast.success('Vote cast successfully!');
      queryClient.invalidateQueries({ queryKey: ['awards', 'season', variables.seasonSlug] });
      queryClient.invalidateQueries({ queryKey: ['awards', 'leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['awards', 'stats'] });
    },
    onError: () => toast.error('Failed to cast vote. You may have already voted in this category.'),
  });
}
