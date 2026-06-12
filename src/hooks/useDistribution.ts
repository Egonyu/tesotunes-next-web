import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

export type DistributionStatus = 'pending' | 'processing' | 'live' | 'failed' | 'rejected' | 'removed';

export interface Distribution {
  id: number;
  platform_code: string;
  platform_name: string;
  status: DistributionStatus;
  platform_url: string | null;
  live_date: string | null;
  total_streams: string;
  total_revenue: string;
  last_synced: string | null;
  error_message: string | null;
}

export interface DistributionAnalytics {
  total_distributions: number;
  live: number;
  pending: number;
  failed: number;
  total_streams: number;
  total_revenue: string;
  platforms: Array<{
    platform: string;
    count: number;
    live: number;
    streams: number;
    revenue: string;
  }>;
  recent_distributions: Array<{
    id: number;
    song: string | null;
    platform: string;
    status: DistributionStatus;
    live_date: string | null;
    streams: string;
    revenue: string;
  }>;
}

export interface SubmitDistributionPayload {
  platforms: string[];
  release_date?: string;
  territories?: string[];
}

// ============================================================================
// Hooks
// ============================================================================

export function useDistributionAnalytics() {
  return useQuery({
    queryKey: ['distribution', 'analytics'],
    queryFn: () =>
      apiGet<{ success: boolean; data: DistributionAnalytics }>('/artist/distribution-analytics').then(
        (r) => r.data
      ),
  });
}

export function useSongDistributions(songId: number | null) {
  return useQuery({
    queryKey: ['distribution', 'song', songId],
    queryFn: () =>
      apiGet<{ success: boolean; data: Distribution[] }>(`/songs/${songId}/distributions`).then(
        (r) => r.data
      ),
    enabled: songId !== null,
  });
}

export function useSubmitDistribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ songId, payload }: { songId: number; payload: SubmitDistributionPayload }) =>
      apiPost<{ success: boolean; message: string; data: { distributions: Distribution[]; estimated_delivery: string } }>(
        `/songs/${songId}/distribute`,
        payload
      ),
    onSuccess: (_data, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ['distribution', 'song', songId] });
      queryClient.invalidateQueries({ queryKey: ['distribution', 'analytics'] });
    },
  });
}

export function useRetryDistribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (distributionId: number) =>
      apiPost<{ success: boolean; message: string }>(`/distributions/${distributionId}/retry`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution'] });
    },
  });
}

export function useRemoveDistribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (distributionId: number) =>
      apiPost<{ success: boolean; message: string }>(`/distributions/${distributionId}/remove`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution'] });
    },
  });
}
