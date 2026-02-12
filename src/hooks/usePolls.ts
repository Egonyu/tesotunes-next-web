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
  category: string;
  creator: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  createdAt: string;
  endsAt: string;
  hasVoted: boolean;
  votedOptionId?: number;
  status: 'active' | 'ended';
}

// Transform API response to component format
export function transformPoll(data: Record<string, unknown>): Poll {
  const options = (data.options as Array<Record<string, unknown>> || []).map((opt: Record<string, unknown>, index: number) => ({
    id: (opt.id as number) || index + 1,
    text: (opt.text as string) || (opt.option_text as string) || '',
    votes: (opt.votes as number) || (opt.vote_count as number) || 0,
    percentage: (opt.percentage as number) || 0,
  }));

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
  
  // Calculate percentages if not provided
  options.forEach(opt => {
    if (opt.percentage === 0 && totalVotes > 0) {
      opt.percentage = Math.round((opt.votes / totalVotes) * 100);
    }
  });

  const creator = data.creator as Record<string, unknown> || data.user as Record<string, unknown> || {};
  
  return {
    id: data.id as number,
    question: (data.question as string) || (data.title as string) || '',
    description: data.description as string | undefined,
    options,
    totalVotes,
    category: (data.category as string) || 'General',
    creator: {
      name: (creator.name as string) || 'Anonymous',
      avatar: (creator.avatar as string) || (creator.profile_image as string) || '/images/avatar-placeholder.png',
      isVerified: (creator.is_verified as boolean) || false,
    },
    createdAt: (data.created_at as string) || new Date().toISOString(),
    endsAt: (data.ends_at as string) || (data.end_date as string) || new Date().toISOString(),
    hasVoted: (data.has_voted as boolean) || false,
    votedOptionId: data.voted_option_id as number | undefined,
    status: (data.status as 'active' | 'ended') || ((data.is_active as boolean) ? 'active' : 'ended'),
  };
}

// Get all polls with optional filters
export function usePolls(category?: string, status?: 'active' | 'ended') {
  return useQuery({
    queryKey: ['polls', category, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (status) params.append('status', status);
      
      const response = await apiGet<{ data?: unknown }>(`/api/polls?${params.toString()}`);
      return response.data || response;
    },
  });
}

// Get a single poll
export function usePoll(pollId: string) {
  return useQuery({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      const response = await apiGet<{ data?: unknown }>(`/api/polls/${pollId}`);
      return response.data || response;
    },
    enabled: !!pollId,
  });
}

// Get trending/featured polls
export function useTrendingPolls() {
  return useQuery({
    queryKey: ['polls', 'trending'],
    queryFn: async () => {
      const response = await apiGet<{ data?: unknown }>('/polls/trending');
      return response.data || response;
    },
  });
}

// Create a new poll
export function useCreatePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      question: string;
      description?: string;
      options: string[];
      category: string;
      endsAt: string;
    }) => {
      const response = await apiPost<{ data?: unknown }>('/polls', data);
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
      const response = await apiPost<{ data?: unknown }>(`/api/polls/${pollId}/vote`, { option_id: optionId });
      return response.data || response;
    },
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

// Share a poll
export function useSharePoll() {
  return useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiPost<{ data?: unknown }>(`/api/polls/${pollId}/share`, {});
      return response.data || response;
    },
  });
}

// Delete a poll (for poll creator)
export function useDeletePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiDelete<{ data?: unknown }>(`/api/polls/${pollId}`);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

// Get poll categories
export function usePollCategories() {
  return useQuery({
    queryKey: ['poll-categories'],
    queryFn: async () => {
      const response = await apiGet<{ data?: unknown }>('/polls/categories');
      return response.data || response;
    },
  });
}
