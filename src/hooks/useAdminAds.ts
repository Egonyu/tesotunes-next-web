'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AdType = 'image' | 'html' | 'audio' | 'native' | 'google_adsense';
export type AdFormat = 'banner_728x90' | 'banner_320x50' | 'square_300x250' | 'native' | 'audio' | 'html';

export interface AdminAd {
  id: number;
  uuid: string;
  title: string;
  advertiser_name: string | null;
  type: AdType;
  format: AdFormat;
  image_url: string | null;
  click_url: string | null;
  cta_text: string | null;
  html_content: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  native_headline: string | null;
  native_body: string | null;
  native_image_url: string | null;
  adsense_slot_id: string | null;
  adsense_format: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  total_budget_ugx: string | null;
  daily_budget_ugx: string | null;
  cost_per_impression_ugx: string | null;
  cost_per_click_ugx: string | null;
  target_tiers: string[] | null;
  target_devices: string[] | null;
  target_countries: string[] | null;
  priority: number;
  notes: string | null;
  impressions?: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  stats?: { impressions: number; clicks: number; ctr: number };
  assignments?: AdAssignment[];
}

export interface AdAssignment {
  id: number;
  ad_id: number;
  placement_key: string;
  label?: string;
  priority: number;
  weight: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  ad_title?: string;
  ad_type?: AdType;
  ad_format?: AdFormat;
  ad_is_active?: boolean;
  advertiser?: string | null;
}

export interface AdPlacementConfig {
  placement_key: string;
  label: string;
  description: string | null;
  device_type: 'all' | 'desktop' | 'mobile';
  allowed_formats: string[];
  dimensions_width: number | null;
  dimensions_height: number | null;
  is_enabled: boolean;
  target_tiers: string[] | null;
  frequency_cap_per_day: number;
  max_ads_per_page: number;
  notes: string | null;
  is_audio: boolean;
  assignments_count: number | null;
  active_assignments_count: number | null;
  impressions_7d: number;
  updated_at: string | null;
  assignments?: AdAssignment[];
}

// ── Admin Ads CRUD ────────────────────────────────────────────────────────────

export function useAdminAdsList(params: { page?: number; search?: string; type?: string; status?: string } = {}) {
  const { page = 1, search = '', type = '', status = '' } = params;
  const searchParams = new URLSearchParams({ page: String(page), per_page: '20' });
  if (search) searchParams.set('search', search);
  if (type) searchParams.set('type', type);
  if (status) searchParams.set('status', status);

  return useQuery({
    queryKey: ['admin', 'ads', params],
    queryFn: () => apiGet<{ data: AdminAd[]; meta: { current_page: number; last_page: number; total: number } }>(
      `/admin/ads?${searchParams}`
    ),
    staleTime: 30_000,
  });
}

export function useAdminAd(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'ads', id],
    queryFn: () => apiGet<{ data: AdminAd }>(`/admin/ads/${id}`),
    enabled: id !== null,
    select: (res) => res.data,
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminAd>) => apiPost<{ data: AdminAd }>('/admin/ads', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      toast.success('Ad created successfully.');
    },
    onError: () => toast.error('Failed to create ad.'),
  });
}

export function useUpdateAd(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminAd>) => apiPut<{ data: AdminAd }>(`/admin/ads/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      toast.success('Ad updated.');
    },
    onError: () => toast.error('Failed to update ad.'),
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/ads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      toast.success('Ad deleted.');
    },
    onError: () => toast.error('Failed to delete ad.'),
  });
}

export function useActivateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiPost(`/admin/ads/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      toast.success('Ad activated.');
    },
    onError: () => toast.error('Failed to activate ad.'),
  });
}

export function usePauseAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiPost(`/admin/ads/${id}/pause`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      toast.success('Ad paused.');
    },
    onError: () => toast.error('Failed to pause ad.'),
  });
}

export function useAdAnalytics(days = 30) {
  return useQuery({
    queryKey: ['admin', 'ads', 'analytics', days],
    queryFn: () => apiGet<{ data: Array<{ ad_id: number; title: string; advertiser: string; type: string; is_active: boolean; impressions: number; clicks: number; ctr: number }>; days: number }>(
      `/admin/ads/analytics?days=${days}`
    ),
    staleTime: 60_000,
  });
}

// ── Placement Zone Management ─────────────────────────────────────────────────

export function useAdPlacements() {
  return useQuery({
    queryKey: ['admin', 'ad-placements'],
    queryFn: () => apiGet<{ data: AdPlacementConfig[] }>('/admin/ad-placements'),
    staleTime: 30_000,
    select: (res) => res.data,
  });
}

export function useAdPlacement(key: string) {
  return useQuery({
    queryKey: ['admin', 'ad-placements', key],
    queryFn: () => apiGet<{ data: AdPlacementConfig }>(`/admin/ad-placements/${key}`),
    enabled: !!key,
    select: (res) => res.data,
  });
}

export function useUpdateAdPlacement(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdPlacementConfig>) => apiPut<{ data: AdPlacementConfig }>(`/admin/ad-placements/${key}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-placements'] });
      toast.success('Zone config updated.');
    },
    onError: () => toast.error('Failed to update zone.'),
  });
}

export function useAssignAdToZone(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { ad_id: number; priority?: number; weight?: number; is_active?: boolean }) =>
      apiPost<{ data: AdAssignment }>(`/admin/ad-placements/${key}/assign`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-placements', key] });
      toast.success('Ad assigned to zone.');
    },
    onError: () => toast.error('Failed to assign ad.'),
  });
}

export function useUpdateAssignment(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, ...data }: { assignmentId: number; priority?: number; weight?: number; is_active?: boolean }) =>
      apiPut(`/admin/ad-placements/${key}/assign/${assignmentId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-placements', key] });
      toast.success('Assignment updated.');
    },
    onError: () => toast.error('Failed to update assignment.'),
  });
}

export function useRemoveAssignment(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => apiDelete(`/admin/ad-placements/${key}/assign/${assignmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-placements', key] });
      toast.success('Ad removed from zone.');
    },
    onError: () => toast.error('Failed to remove ad.'),
  });
}

export function useZoneAnalytics(days = 7) {
  return useQuery({
    queryKey: ['admin', 'ad-placements', 'analytics', days],
    queryFn: () => apiGet<{ data: Array<{ placement_key: string; label: string; impressions: number; clicks: number; ctr: number }>; days: number }>(
      `/admin/ad-placements/analytics?days=${days}`
    ),
    staleTime: 60_000,
  });
}
