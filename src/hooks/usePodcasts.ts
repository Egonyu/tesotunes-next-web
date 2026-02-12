'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

export interface PodcastCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface Podcast {
  id: number;
  uuid: string;
  title: string;
  description: string;
  long_description?: string;
  cover_url: string;
  host_name: string;
  host_bio?: string;
  host_avatar_url?: string;
  category: PodcastCategory;
  episode_count: number;
  subscriber_count: number;
  total_listen_count: number;
  frequency?: string;
  website_url?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  is_subscribed?: boolean;
  latest_episode?: Episode;
  has_new_episodes?: boolean;
  subscribed_at?: string;
}

export interface Episode {
  id: number;
  uuid: string;
  episode_number: number;
  title: string;
  description: string;
  duration_seconds: number;
  published_at: string;
  listen_count: number;
  audio_url?: string;
  is_played?: boolean;
}

export interface PodcastsResponse {
  data: Podcast[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============================================================================
// Browse / Discovery Hooks
// ============================================================================

export function usePodcastCategories() {
  return useQuery({
    queryKey: ['podcast-categories'],
    queryFn: () => apiGet<PodcastCategory[] | { data: PodcastCategory[] }>('/podcast-categories')
      .then(res => Array.isArray(res) ? res : res.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePodcasts(filters?: { category_id?: number; search?: string; per_page?: number; page?: number }) {
  return useQuery({
    queryKey: ['podcasts', filters],
    queryFn: () => apiGet<PodcastsResponse | Podcast[]>('/podcasts', { params: filters })
      .then(res => Array.isArray(res) ? res : res.data),
  });
}

export function useTrendingPodcasts(limit: number = 4) {
  return useQuery({
    queryKey: ['podcasts', 'trending', limit],
    queryFn: () => apiGet<Podcast[] | { data: Podcast[] }>(`/api/podcasts-trending`, { params: { limit } })
      .then(res => Array.isArray(res) ? res : res.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Single Podcast Hooks
// ============================================================================

export function usePodcast(id: string | number) {
  return useQuery({
    queryKey: ['podcast', String(id)],
    queryFn: () => apiGet<Podcast | { data: Podcast }>(`/api/podcasts/${id}`)
      .then(res => 'data' in res && res.data ? res.data as Podcast : res as Podcast),
    enabled: !!id,
  });
}

export function usePodcastEpisodes(podcastId: string | number, page: number = 1) {
  return useQuery({
    queryKey: ['podcast', String(podcastId), 'episodes', page],
    queryFn: () => apiGet<Episode[] | { data: Episode[] }>(`/api/podcasts/${podcastId}/episodes`, { params: { page } })
      .then(res => Array.isArray(res) ? res : res.data),
    enabled: !!podcastId,
  });
}

// ============================================================================
// Subscription Hooks
// ============================================================================

export function useSubscribedPodcasts() {
  return useQuery({
    queryKey: ['podcasts', 'subscribed'],
    queryFn: () => apiGet<Podcast[] | { data: Podcast[] }>('/podcasts/subscribed')
      .then(res => Array.isArray(res) ? res : res.data),
  });
}

export function useSubscribeToPodcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (podcastId: number | string) =>
      apiPost(`/api/podcasts/${podcastId}/subscribe`, {}),
    onSuccess: (_, podcastId) => {
      queryClient.invalidateQueries({ queryKey: ['podcast', String(podcastId)] });
      queryClient.invalidateQueries({ queryKey: ['podcasts', 'subscribed'] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
    },
  });
}

export function useUnsubscribeFromPodcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (podcastId: number | string) =>
      apiDelete(`/api/podcasts/${podcastId}/unsubscribe`),
    onSuccess: (_, podcastId) => {
      queryClient.invalidateQueries({ queryKey: ['podcast', String(podcastId)] });
      queryClient.invalidateQueries({ queryKey: ['podcasts', 'subscribed'] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
    },
  });
}

// ============================================================================
// Helpers
// ============================================================================

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatEpisodeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
