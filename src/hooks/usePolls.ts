'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

export type PollType = 'general' | 'song_battle' | 'artist_contest' | 'research_survey';
export type QuestionType = 'multiple_choice' | 'rating' | 'likert' | 'free_text' | 'ranking';

export interface PollQuestionData {
  id: number;
  question_text: string;
  question_type: QuestionType;
  is_required: boolean;
  allow_multiple: boolean;
  position: number;
  settings?: {
    scale_min?: number;
    scale_max?: number;
    min_label?: string | null;
    max_label?: string | null;
  };
  options: PollOption[];
}

export interface PollAnalytics {
  poll_id: number;
  title: string;
  poll_type: string;
  status: string;
  total_responses: number;
  completed_responses: number;
  guest_responses: number;
  user_responses: number;
  completion_rate: number;
  questions: Array<{
    question_id: number;
    question_text: string;
    question_type: QuestionType;
    answered_count: number;
    skip_rate: number;
    breakdown:
      | Array<{ option_id: number; option_text: string; response_count: number; percentage: number }>
      | { average: number; distribution: Record<string, number>; scale: { min: number; max: number; min_label?: string | null; max_label?: string | null } }
      | { total_answers: number; sample: string[] }
      | null;
  }>;
}

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
  { value: 'research',              label: 'Research Survey' },
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
  // For community polls — sourced from questions[0].options
  options: PollOption[];
  // All questions — used for research survey multi-step form
  questions: PollQuestionData[];
  // Primary question metadata — required for submitting a response
  questionId?: number;
  questionText?: string;
  isMultiQuestion: boolean;
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
  status: 'active' | 'closed' | 'draft' | 'archived';
  showResultsBeforeCompletion: boolean;
  allowGuestResponses: boolean;
}

// ── Transform raw API data → Poll ──────────────────────────────────────────
//
// The new API response structure:
// {
//   "data": {
//     "id": 1,
//     "title": "...",
//     "poll_type": "song_battle",
//     "total_responses": 15,
//     "has_responded": false,
//     "show_results_before_completion": true,
//     "questions": [
//       {
//         "id": 1,
//         "question_text": "...",
//         "question_type": "multiple_choice",
//         "options": [
//           { "id": 1, "text": "Lira", "response_count": 8, "percentage": 53.3 }
//         ]
//       }
//     ],
//     "creator": { "id": 1, "name": "...", "avatar_url": "...", "is_verified": false }
//   }
// }
//
export function transformPoll(data: Record<string, unknown>): Poll {
  const rawQuestions = (data.questions as Array<Record<string, unknown>>) ?? [];
  const firstQuestion = rawQuestions[0] as Record<string, unknown> | undefined;

  const questionId = firstQuestion?.id as number | undefined;
  const questionText = firstQuestion?.question_text as string | undefined;
  const isMultiQuestion = rawQuestions.length > 1;

  // Full question list for research surveys
  const questions: PollQuestionData[] = rawQuestions.map((rq: Record<string, unknown>) => {
    const rawOpts = (rq.options as Array<Record<string, unknown>>) ?? [];
    return {
      id: rq.id as number,
      question_text: (rq.question_text as string) ?? '',
      question_type: (rq.question_type as QuestionType) ?? 'multiple_choice',
      is_required: (rq.is_required as boolean) ?? true,
      allow_multiple: (rq.allow_multiple as boolean) ?? false,
      position: (rq.position as number) ?? 0,
      settings: rq.settings as PollQuestionData['settings'],
      options: rawOpts.map((opt, idx) => ({
        id: (opt.id as number) || idx + 1,
        text: (opt.text as string) || '',
        votes: (opt.response_count as number) ?? 0,
        percentage: (opt.percentage as number) ?? 0,
      })),
    };
  });

  // Options live inside questions[0].options in the new API.
  // Fall back to data.options for any legacy response shape.
  const rawOptions =
    (firstQuestion?.options as Array<Record<string, unknown>> | undefined) ??
    (data.options as Array<Record<string, unknown>> | undefined) ??
    [];

  const options: PollOption[] = rawOptions.map((opt: Record<string, unknown>, index: number) => {
    const rawSong = opt.song as Record<string, unknown> | undefined;
    const rawArtist = opt.artist as Record<string, unknown> | undefined;

    // Song artist is nested: song.artist.name
    const songArtist = rawSong?.artist as Record<string, unknown> | undefined;

    return {
      id: (opt.id as number) || index + 1,
      // PollOptionResource returns "text" (mapped from option_text)
      text: (opt.text as string) || (opt.option_text as string) || '',
      // New API: response_count; legacy fallbacks: votes, vote_count
      votes: (opt.response_count as number) ?? (opt.votes as number) ?? (opt.vote_count as number) ?? 0,
      percentage: (opt.percentage as number) ?? 0,
      song: rawSong
        ? {
            id: rawSong.id as number,
            title: rawSong.title as string,
            artwork_url: (rawSong.artwork_url as string) ?? null,
            artist_name: (songArtist?.name as string) ?? (rawSong.artist_name as string) ?? null,
          }
        : undefined,
      artist: rawArtist
        ? {
            id: rawArtist.id as number,
            stage_name: (rawArtist.name as string) || (rawArtist.stage_name as string) || '',
            avatar_url: (rawArtist.avatar_url as string) ?? null,
            is_verified: (rawArtist.is_verified as boolean) || false,
          }
        : undefined,
    };
  });

  // New API: total_responses; legacy: total_votes; fallback: sum options
  const totalVotes =
    (data.total_responses as number) ??
    (data.total_votes as number) ??
    options.reduce((sum, opt) => sum + opt.votes, 0);

  // Recompute percentages from response counts when server didn't include them
  // (e.g., results hidden before completion — percentages arrive as 0/undefined)
  if (totalVotes > 0 && options.every((o) => o.percentage === 0)) {
    options.forEach((opt) => {
      opt.percentage = Math.round((opt.votes / totalVotes) * 100);
    });
  }

  const creator =
    (data.creator as Record<string, unknown>) ??
    (data.user as Record<string, unknown>) ??
    {};

  return {
    id: data.id as number,
    question: (data.title as string) || (data.question as string) || '',
    description: data.description as string | undefined,
    poll_type: (data.poll_type as PollType) || 'general',
    category: data.category as string | undefined,
    category_label: data.category_label as string | undefined,
    credits_reward: (data.credits_reward as number) || 3,
    options,
    questions,
    questionId,
    questionText,
    isMultiQuestion,
    totalVotes,
    creator: {
      name: (creator.name as string) || (creator.display_name as string) || 'TesoTunes',
      avatar:
        (creator.avatar_url as string) ||
        (creator.avatar as string) ||
        (creator.profile_image as string) ||
        '/images/avatar-placeholder.png',
      isVerified: (creator.is_verified as boolean) || false,
    },
    createdAt: (data.created_at as string) || new Date().toISOString(),
    endsAt: (data.ends_at as string) || new Date().toISOString(),
    // New API: has_responded; legacy: has_voted
    hasVoted: (data.has_responded as boolean) || (data.has_voted as boolean) || false,
    votedOptionId: data.voted_option_id as number | undefined,
    status: (data.status as Poll['status']) || 'active',
    showResultsBeforeCompletion: (data.show_results_before_completion as boolean) || false,
    allowGuestResponses: (data.allow_guest_responses as boolean) ?? true,
  };
}

// ── Hooks ──────────────────────────────────────────────────────────────────

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
      // Use the base show endpoint — PollResource computes show_results_before_completion
      // internally so results are included when the user has already responded or the
      // poll has show_results_before_completion=true. Calling /results before voting
      // causes a 403 for restricted polls.
      const response = await apiGet<{ data?: unknown }>(`/polls/${pollId}`);
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
      allow_multiple?: boolean;
      show_results_before_completion?: boolean;
      questions: Array<{
        question_text: string;
        question_type: string;
        is_required?: boolean;
        allow_multiple?: boolean;
        options?: Array<{ option_text: string; song_id?: number; artist_id?: number }>;
        settings?: { scale_min?: number; scale_max?: number };
      }>;
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
    mutationFn: async ({
      pollId,
      questionId,
      optionId,
    }: {
      pollId: string;
      questionId: number;
      optionId: number;
    }) => {
      const response = await apiPost<{ data?: unknown; credits_earned?: number; success?: boolean }>(
        `/polls/${pollId}/respond`,
        {
          answers: [{ question_id: questionId, option_ids: [optionId] }],
        }
      );
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

export function useSubmitSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pollId,
      answers,
    }: {
      pollId: string;
      answers: Array<{
        question_id: number;
        option_ids?: number[];
        rating_value?: number;
        answer_text?: string;
      }>;
    }) => {
      const response = await apiPost<{ data?: unknown; credits_earned?: number; success?: boolean }>(
        `/polls/${pollId}/respond`,
        { answers }
      );
      return response;
    },
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useAdminPollAnalytics(pollId: number | null) {
  return useQuery({
    queryKey: ['admin', 'poll-analytics', pollId],
    queryFn: async () => {
      const response = await apiGet<{ data?: PollAnalytics }>(`/admin/polls/${pollId}/analytics`);
      return (response.data || response) as PollAnalytics;
    },
    enabled: !!pollId,
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
