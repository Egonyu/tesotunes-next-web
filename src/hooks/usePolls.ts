'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

// Types
export interface PollOption {
  id: number;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: number;
  question: string;
  description?: string;
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

// Transform API response to component format
// Works with both PollResource (public) and raw Poll model (admin)
export function transformPoll(data: Record<string, unknown>): Poll {
  const rawOptions = data.options as Array<Record<string, unknown>> || [];
  const options = rawOptions.map((opt: Record<string, unknown>, index: number) => ({
    id: (opt.id as number) || index + 1,
    text: (opt.text as string) || (opt.option_text as string) || '',
    votes: (opt.votes as number) || (opt.vote_count as number) || 0,
    percentage: (opt.percentage as number) || 0,
  }));

  const totalVotes = (data.total_votes as number) || options.reduce((sum, opt) => sum + opt.votes, 0);

  // Calculate percentages if not provided
  options.forEach(opt => {
    if (opt.percentage === 0 && totalVotes > 0) {
      opt.percentage = Math.round((opt.votes / totalVotes) * 100);
    }
  });

  // Creator can come from "creator" (PollResource) or "user" (admin raw model)
  const creator = data.creator as Record<string, unknown> || data.user as Record<string, unknown> || {};

  // user_vote from PollResource is an array of voted option IDs
  const userVote = data.user_vote as number[] | undefined;

  return {
    id: data.id as number,
    question: (data.title as string) || (data.question as string) || '',
    description: data.description as string | undefined,
    options,
    totalVotes,
    creator: {
      name: (creator.name as string) || (creator.display_name as string) || 'Anonymous',
      avatar: (creator.avatar as string) || (creator.profile_image as string) || '/images/avatar-placeholder.png',
      isVerified: (creator.is_verified as boolean) || false,
    },
    createdAt: (data.created_at as string) || new Date().toISOString(),
    endsAt: (data.ends_at as string) || new Date().toISOString(),
    hasVoted: (data.has_voted as boolean) || false,
    votedOptionId: userVote?.[0] ?? (data.voted_option_id as number | undefined),
    status: (data.status as 'active' | 'closed') || ((data.is_active as boolean) ? 'active' : 'closed'),
  };
}

// Get all polls with optional filters
export function usePolls(status?: 'active' | 'closed') {
  return useQuery({
    queryKey: ['polls', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      // PollResource::collection returns { data: [...], links: {...}, meta: {...} }
      const response = await apiGet<{ data?: unknown[] }>(`/polls?${params.toString()}`);
      return response.data || [];
    },
  });
}

// Get a single poll (public endpoint is /polls/{id}/results)
export function usePoll(pollId: string) {
  return useQuery({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      // Public single-poll endpoint uses PollResource
      const response = await apiGet<{ data?: unknown }>(`/polls/${pollId}/results`);
      return response.data || response;
    },
    enabled: !!pollId,
  });
}


// Create a new poll
export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      options: string[];
      ends_at: string;
      allow_multiple_votes?: boolean;
    }) => {
      const response = await apiPost<{ data?: unknown }>('/admin/polls', data);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

// Vote on a poll
export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: number }) => {
      const response = await apiPost<{ data?: unknown }>(`/polls/${pollId}/vote`, { option_id: optionId });
      return response.data || response;
    },
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}


// Delete a poll (for poll creator)
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


