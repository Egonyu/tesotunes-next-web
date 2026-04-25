'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

export type PollType = 'general' | 'song_battle' | 'artist_contest';

export const POLL_CATEGORIES = [
  { value: 'general',               label: 'General' },
  { value: 'song_battle',           label: 'Song Battle' },
  { value: 'artist_contest',        label: 'Artist Contest' },
  { value: 'ateso_vs_english',      label: 'Ateso vs English' },
  { value: 'district_showdown',     label: 'District Showdown' },
  { value: 'traditional_vs_modern', label: 'Traditional vs Modern' },
  { value: 'rising_star',           label: 'Rising Star' },
  { value: 'weekly_favorite',       label: 'Weekly Favorite' },
  { value: 'genre_face_off',        label: 'Genre Face-Off' },
  { value: 'fan_choice',            label: 'Fan Choice' },
] as const;

export interface SongSummary {
  id: number;
  title: string;
  artwork_url: string | null;
  artist_name: string | null;
}

export interface ArtistSummary {
  id: number;
  stage_name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  percentage: number;
  song?: SongSummary;
  artist?: ArtistSummary;
}

export interface Poll {
  id: number;
  question: string;
  description?: string;
  poll_type: PollType;
  category?: string;
  category_label?: string;
  credits_reward: number;
  options: PollOption[];
  totalVotes: number;
  creator: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  createdAt: string;
  endsAt: string;
  hasVoted: boolean;
  votedOptionId?: number;
  status: 'active' | 'closed';
}

export function transformPoll(data: Record<string, unknown>): Poll {
  const rawOptions = (data.options as Array<Record<string, unknown>>) || [];

  const options: PollOption[] = rawOptions.map((opt: Record<string, unknown>, index: number) => {
    const rawSong = opt.song as Record<string, unknown> | undefined;
    const rawArtist = opt.artist as Record<string, unknown> | undefined;

    return {
      id: (opt.id as number) || index + 1,
      text: (opt.text as string) || (opt.option_text as string) || '',
      votes: (opt.votes as number) || (opt.vote_count as number) || 0,
      percentage: (opt.percentage as number) || 0,
      song: rawSong
        ? {
            id: rawSong.id as number,
            title: rawSong.title as string,
            artwork_url: (rawSong.artwork_url as string) || null,
            artist_name: (rawSong.artist_name as string) || null,
          }
        : undefined,
      artist: rawArtist
        ? {
            id: rawArtist.id as number,
            stage_name: rawArtist.stage_name as string,
            avatar_url: (rawArtist.avatar_url as string) || null,
            is_verified: (rawArtist.is_verified as boolean) || false,
          }
        : undefined,
    };
  });

  const totalVotes = (data.total_votes as number) || options.reduce((sum, opt) => sum + opt.votes, 0);

  options.forEach(opt => {
    if (opt.percentage === 0 && totalVotes > 0) {
      opt.percentage = Math.round((opt.votes / totalVotes) * 100);
    }
  });

  const creator = (data.creator as Record<string, unknown>) || (data.user as Record<string, unknown>) || {};
  const userVote = data.user_vote as number[] | undefined;

  return {
    id: data.id as number,
    question: (data.title as string) || (data.question as string) || '',
    description: data.description as string | undefined,
    poll_type: (data.poll_type as PollType) || 'general',
    category: data.category as string | undefined,
    category_label: data.category_label as string | undefined,
    credits_reward: (data.credits_reward as number) || 3,
    options,
    totalVotes,
    creator: {
      name: (creator.name as string) || (creator.display_name as string) || 'TesoTunes',
      avatar: (creator.avatar as string) || (creator.profile_image as string) || '/images/avatar-placeholder.png',
      isVerified: (creator.is_verified as boolean) || false,
    },
    createdAt: (data.created_at as string) || new Date().toISOString(),
    endsAt: (data.ends_at as string) || new Date().toISOString(),
    hasVoted: (data.has_voted as boolean) || false,
    votedOptionId: userVote?.[0] ?? (data.voted_option_id as number | undefined),
    status: (data.status as 'active' | 'closed') || 'active',
  };
}

export function usePolls(status?: 'active' | 'closed', pollType?: PollType, category?: string) {
  return useQuery({
    queryKey: ['polls', status, pollType, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (pollType) params.append('poll_type', pollType);
      if (category) params.append('category', category);

      const response = await apiGet<{ data?: unknown[] }>(`/polls?${params.toString()}`);
      return response.data || [];
    },
  });
}

export function usePoll(pollId: string) {
  return useQuery({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      const response = await apiGet<{ data?: unknown }>(`/polls/${pollId}/results`);
      return response.data || response;
    },
    enabled: !!pollId,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      poll_type?: PollType;
      category?: string;
      credits_reward?: number;
      ends_at: string;
      allow_multiple_votes?: boolean;
      show_results_before_vote?: boolean;
      options?: string[];
      song_options?: { song_id: number; label?: string }[];
      artist_options?: { artist_id: number; label?: string }[];
    }) => {
      const response = await apiPost<{ data?: unknown }>('/polls', data);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: number }) => {
      const response = await apiPost<{ data?: unknown; credits_earned?: number }>(`/polls/${pollId}/vote`, { option_id: optionId });
      return response;
    },
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiDelete<{ data?: unknown }>(`/polls/${pollId}`);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useSongsSearch(query: string) {
  return useQuery({
    queryKey: ['songs-search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const params = new URLSearchParams({ search: query, per_page: '20', status: 'published' });
      const response = await apiGet<{ data?: unknown[] }>(`/songs?${params.toString()}`);
      return (response.data || []) as Array<{
        id: number;
        title: string;
        artwork_url: string | null;
        artist: { id: number; stage_name: string } | null;
      }>;
    },
    enabled: query.length >= 2,
  });
}

export function useArtistsSearch(query: string) {
  return useQuery({
    queryKey: ['artists-search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const params = new URLSearchParams({ search: query, per_page: '20' });
      const response = await apiGet<{ data?: unknown[] }>(`/artists?${params.toString()}`);
      return (response.data || []) as Array<{
        id: number;
        stage_name: string;
        avatar_url: string | null;
        is_verified: boolean;
      }>;
    },
    enabled: query.length >= 2,
  });
}
