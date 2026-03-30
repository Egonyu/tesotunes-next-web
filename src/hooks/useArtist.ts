import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api, apiGet, apiPost, apiPut, apiDelete, apiPostForm } from "@/lib/api";
import { useSession } from "next-auth/react";
import { slugify } from "@/lib/utils";
import {
  buildArtistAlbumCreateFormData,
  buildArtistAlbumUpdateFormData,
  buildArtistSongUploadFormData,
  type ArtistAlbumPayload,
  type ArtistSongUploadPayload,
} from "@/lib/artist-media-payloads";

// ============================================================================
// Types
// ============================================================================

export interface ArtistInfo {
  id: number;
  name: string;
  avatar: string | null;
  is_verified: boolean;
}

export interface ArtistStat {
  label: string;
  value: string;
  change: number;
  period: string;
}

export interface RecentSong {
  id: number;
  title: string;
  artwork: string | null;
  plays: number;
  downloads: number;
  trend: number;
  status: string;
  released: string;
}

export interface PendingAction {
  id: string;
  type: 'review' | 'earnings' | 'event';
  title: string;
  description: string;
  time: string;
}

export interface ChartDataPoint {
  date: string;
  plays: number;
}

export interface ArtistDashboard {
  artist: ArtistInfo;
  stats: ArtistStat[];
  recent_songs: RecentSong[];
  pending_actions: PendingAction[];
  chart_data: ChartDataPoint[];
}

export interface ArtistSong {
  id: number;
  title: string;
  cover: string;
  artwork_url?: string;
  album: string | null;
  plays: number;
  downloads: number;
  duration: string;
  duration_seconds?: number;
  status: 'published' | 'pending' | 'draft' | 'rejected';
  release_date: string;
}

export interface SongsResponse {
  data: ArtistSong[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  status_counts: {
    total: number;
    published: number;
    pending: number;
    draft: number;
    rejected?: number;
  };
}

export interface EarningsStats {
  balance: number;
  pending_earnings: number;
  total_earnings: number;
  this_month: number;
  monthly_change: number;
}

export interface EarningsSource {
  source: string;
  amount: number;
  percentage: number;
}

export interface Transaction {
  id: number;
  type: 'earning' | 'withdrawal';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

export interface EarningsData {
  stats: EarningsStats;
  earnings_sources: EarningsSource[];
  transactions: Transaction[];
  monthly_chart?: MonthlyEarning[];
  monthly_trends?: MonthlyEarning[];
  per_song_earnings?: PerSongEarnings[];
}

export interface PerSongEarnings {
  id: number;
  title: string;
  artwork_url: string | null;
  streams_revenue: number;
  downloads_revenue: number;
  tips_revenue: number;
  total: number;
}

export interface TopSong {
  id: number;
  title: string;
  artwork: string | null;
  play_count: number;
  download_count: number;
}

export interface AnalyticsData {
  period: string;
  plays_over_time: Array<{ date: string; plays: number }>;
  top_songs: TopSong[];
  demographics: {
    countries: Array<{ country: string; count: number }>;
    devices: Array<{ device_type: string; count: number }>;
  };
  engagement: {
    total_plays: number;
    unique_listeners: number;
    avg_listen_time: number;
  };
}

export interface ArtistProfile {
  id: number;
  stage_name: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  country: string | null;
  city: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  is_verified: boolean;
  verification_status: string;
  payout_phone_number: string | null;
  can_upload: boolean;
  auto_publish: boolean;
}

// ============================================================================
// Dashboard Hook
// ============================================================================

export function useArtistDashboard(options?: { enabled?: boolean }) {
  const { status } = useSession();

  return useQuery({
    queryKey: ["artist", "dashboard"],
    queryFn: () => apiGet<{ data: ArtistDashboard }>("/artist/dashboard")
      .then(res => res.data),
    staleTime: 30 * 1000, // 30 seconds
    enabled: options?.enabled ?? status === "authenticated",
  });
}

// ============================================================================
// Songs Hooks
// ============================================================================

export function useMyArtistSongs(params?: {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}, options?: { enabled?: boolean }) {
  const { status } = useSession();

  return useQuery({
    queryKey: ["artist", "songs", params],
    queryFn: () => apiGet<SongsResponse>("/artist/songs", { params }),
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? status === "authenticated",
  });
}

export function useArtistSong(id: number) {
  return useQuery({
    queryKey: ["artist", "songs", id],
    queryFn: () => apiGet<{ data: ArtistSong }>(`/artist/songs/${id}`)
      .then(res => res.data),
    enabled: !!id,
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ArtistSong> }) =>
      apiPut<{ message: string }>(`/artist/songs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "songs"] });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiDelete<{ message: string }>(`/artist/songs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "songs"] });
    },
  });
}

// ============================================================================
// Earnings Hooks
// ============================================================================

export function useArtistEarnings() {
  return useQuery({
    queryKey: ["artist", "earnings"],
    queryFn: () => apiGet<{ data: EarningsData }>("/artist/earnings")
      .then(res => res.data),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: number;
      payment_method: 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'zengapay';
      phone_number?: string;
    }) => apiPost<{ message: string }>("/artist/earnings/withdraw", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "earnings"] });
    },
  });
}

// Per-song earnings breakdown
export interface SongEarning {
  song_id: number;
  title: string;
  artwork_url: string | null;
  streams_revenue: number;
  downloads_revenue: number;
  tips_revenue: number;
  total_revenue: number;
  play_count: number;
  download_count: number;
}

export function usePerSongEarnings(params?: { page?: number; per_page?: number; sort?: string }) {
  return useQuery({
    queryKey: ['artist', 'earnings', 'songs', params],
    queryFn: () =>
      apiGet<{ data: SongEarning[]; meta?: { total: number; current_page: number; last_page: number } }>(
        '/artist/earnings/songs',
        { params }
      ),
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Royalty Splits
// ============================================================================

export interface RoyaltySplit {
  id: number;
  song_id: number;
  song_title: string;
  song_artwork?: string | null;
  recipient_id: number;
  recipient_name: string;
  recipient_email?: string;
  percentage: number;
  applies_to_streaming: boolean;
  applies_to_downloads: boolean;
  status: 'active' | 'pending' | 'revoked';
  total_earned: number;
  pending_payout: number;
}

export interface RoyaltySplitsResponse {
  data: RoyaltySplit[];
}

export function useRoyaltySplits(songId?: number) {
  return useQuery({
    queryKey: ['artist', 'royalty-splits', songId ?? 'all'],
    queryFn: () =>
      apiGet<RoyaltySplitsResponse | RoyaltySplit[]>(
        songId ? `/artist/songs/${songId}/royalty-splits` : '/artist/royalty-splits'
      ).then(res => (Array.isArray(res) ? res : res.data)),
    staleTime: 2 * 60 * 1000,
  });
}

export interface CreateRoyaltySplitData {
  song_id: number;
  recipient_email: string;
  recipient_name: string;
  percentage: number;
  applies_to_streaming: boolean;
  applies_to_downloads: boolean;
}

export interface UpdateRoyaltySplitData {
  percentage?: number;
  applies_to_streaming?: boolean;
  applies_to_downloads?: boolean;
}

export function useCreateRoyaltySplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoyaltySplitData) =>
      apiPost<{ message: string; data: RoyaltySplit }>(
        `/artist/songs/${data.song_id}/royalty-splits`,
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'royalty-splits'] });
      queryClient.invalidateQueries({ queryKey: ['artist', 'royalty-splits', variables.song_id] });
    },
  });
}

export function useUpdateRoyaltySplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ splitId, data }: { splitId: number; data: UpdateRoyaltySplitData }) =>
      apiPut<{ message: string }>(`/artist/royalty-splits/${splitId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'royalty-splits'] });
    },
  });
}

export function useDeleteRoyaltySplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (splitId: number) =>
      apiDelete<{ message: string }>(`/artist/royalty-splits/${splitId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'royalty-splits'] });
    },
  });
}

// ============================================================================
// Analytics Hook
// ============================================================================

export function useArtistAnalytics(period: number = 30) {
  return useQuery({
    queryKey: ["artist", "analytics", period],
    queryFn: () => apiGet<{ data: AnalyticsData }>("/artist/analytics", {
      params: { period },
    }).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Albums Hook
// ============================================================================

export function useArtistAlbums(params?: { page?: number; per_page?: number; enabled?: boolean }) {
  const enabled = params?.enabled !== false;
  return useQuery({
    queryKey: ["artist", "albums", params],
    queryFn: () => apiGet<{
      data: Array<{ id: number; title: string; artwork: string | null; songs_count: number }>;
      pagination: { current_page: number; last_page: number; per_page: number; total: number };
    }>("/artist/albums", { params: { page: params?.page, per_page: params?.per_page } }),
    staleTime: 60 * 1000,
    enabled,
    retry: false,
  });
}

// ============================================================================
// Profile Hooks
// ============================================================================

export function useArtistProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["artist", "profile"],
    queryFn: () => apiGet<{ data: ArtistProfile }>("/artist/profile")
      .then(res => res.data),
    enabled: options?.enabled !== false,
    retry: false, // Don't retry on auth failures
  });
}

export function useUpdateArtistProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ArtistProfile>) =>
      apiPut<{ message: string }>("/artist/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "profile"] });
    },
  });
}

// ============================================================================
// Avatar / Banner Upload Hooks
// ============================================================================

export function useUpdateArtistAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("profile_image", file);
      return apiPostForm<{ success: boolean; message: string; data?: { url: string } }>(
        "/artist/profile/avatar",
        formData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "dashboard"] });
    },
  });
}

export function useUpdateArtistBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("banner", file);
      formData.append("cover_image", file);
      return apiPostForm<{ success: boolean; message: string; data?: { url: string } }>(
        "/artist/profile/banner",
        formData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "dashboard"] });
    },
  });
}

// ============================================================================
// Song Upload Hook
// ============================================================================

export type UploadSongData = ArtistSongUploadPayload;

export interface UploadSongResponse {
  message: string;
  data: {
    id: number;
    title: string;
    status: 'pending' | 'published' | 'draft';
    artwork_url: string | null;
  };
}

export interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
}

function isRetryableDuplicateSongUploadError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  const responseData = error.response?.data as { message?: string; error?: string; errors?: Record<string, unknown> } | undefined;
  const messageParts = [
    error.message,
    responseData?.message,
    responseData?.error,
    JSON.stringify(responseData?.errors ?? {}),
  ].filter(Boolean);
  const combinedMessage = messageParts.join(" ").toLowerCase();

  const looksLikeDuplicate =
    combinedMessage.includes("duplicate") ||
    combinedMessage.includes("already exists") ||
    combinedMessage.includes("integrity constraint") ||
    combinedMessage.includes("sqlstate") ||
    combinedMessage.includes("slug");

  return looksLikeDuplicate && (status === 500 || status === 422 || status === 409);
}

function buildRetrySongSlug(title: string) {
  const baseSlug = slugify(title) || "song";
  return `${baseSlug}-${Date.now()}`;
}

export function useUploadSong(onProgress?: (progress: UploadProgress) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadSongData) => {
      const submitUpload = (payload: UploadSongData) => {
        const uploadFormData = buildArtistSongUploadFormData(payload);

        return api.post<UploadSongResponse>('/artist/songs', uploadFormData, {
          timeout: 300000,
          onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
            if (onProgress && progressEvent.total) {
              onProgress({
                percent: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                loaded: progressEvent.loaded,
                total: progressEvent.total,
              });
            }
          },
        }).then((res) => res.data);
      };

      try {
        return await submitUpload(data);
      } catch (error) {
        if (!data.slug && isRetryableDuplicateSongUploadError(error)) {
          return submitUpload({
            ...data,
            slug: buildRetrySongSlug(data.title),
          });
        }

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "songs"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "dashboard"] });
    },
  });
}

// ============================================================================
// Create Album Hook
// ============================================================================

export type CreateAlbumData = ArtistAlbumPayload;

export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAlbumData) => {
      const formData = buildArtistAlbumCreateFormData(data);

      return apiPostForm<{ message: string; data: { id: number; title: string } }>('/artist/albums', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "albums"] });
    },
  });
}

// ============================================================================
// Album Detail Hook
// ============================================================================

export interface AlbumDetail {
  id: number;
  title: string;
  description: string | null;
  artwork: string | null;
  artwork_url: string | null;
  type: 'album' | 'single' | 'ep';
  status: 'draft' | 'released' | 'archived';
  release_date: string | null;
  genre: string | null;
  songs_count: number;
  total_plays: number;
  songs: Array<{
    id: number;
    title: string;
    duration_seconds: number;
    play_count: number;
    status: string;
  }>;
  created_at: string;
  updated_at: string;
}

export function useArtistAlbumDetail(id: number | string) {
  return useQuery({
    queryKey: ["artist", "album", id],
    queryFn: () =>
      apiGet<{ data: AlbumDetail }>(`/artist/albums/${id}`).then((res) => res.data),
    enabled: !!id,
  });
}

// ============================================================================
// Update Album Hook
// ============================================================================

export interface UpdateAlbumData {
  title?: string;
  description?: string;
  release_date?: string;
  type?: 'album' | 'single' | 'ep';
  genre?: string;
  cover_image?: File;
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: UpdateAlbumData }) => {
      const formData = buildArtistAlbumUpdateFormData(data);

      return apiPostForm<{ message: string; data: { id: number; title: string } }>(
        `/artist/albums/${id}`,
        formData
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["artist", "albums"] });
      queryClient.invalidateQueries({ queryKey: ["artist", "album", variables.id] });
    },
  });
}

// ============================================================================
// Artist Referrals Types
// ============================================================================

export interface ArtistReferralStats {
  total_referrals: number;
  active_fans: number;
  total_commission: number;
  pending_commission: number;
  conversion_rate: number;
  this_month_referrals: number;
  monthly_change: number;
}

export interface ArtistReferralLink {
  referral_code: string;
  referral_link: string;
  branded_link: string;
  qr_code_url: string | null;
}

export interface FanSignup {
  id: string;
  fan: {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
  };
  status: 'pending' | 'active' | 'inactive';
  joined_at: string;
  last_active_at: string | null;
  streams: number;
  purchases: number;
  commission_earned: number;
}

export interface ArtistReferralDashboard {
  stats: ArtistReferralStats;
  link: ArtistReferralLink;
  recent_signups: FanSignup[];
  top_fans: FanSignup[];
  earnings_chart: Array<{ date: string; commission: number; signups: number }>;
}

export interface PromoMaterial {
  id: number;
  type: 'banner' | 'story' | 'post' | 'flyer';
  title: string;
  description: string;
  image_url: string;
  download_url: string;
  dimensions: string;
  platform: 'instagram' | 'twitter' | 'facebook' | 'whatsapp' | 'universal';
}

export interface ArtistEarningsShare {
  total_commission: number;
  pending_payout: number;
  paid_out: number;
  commission_rate: number;
  transactions: Array<{
    id: number;
    fan_name: string;
    purchase_type: 'subscription' | 'store' | 'event' | 'credits';
    purchase_amount: number;
    commission_amount: number;
    status: 'pending' | 'paid';
    date: string;
  }>;
}

// ============================================================================
// Artist Referral Dashboard Hook
// ============================================================================

export function useArtistReferralDashboard() {
  return useQuery({
    queryKey: ["artist", "referrals", "dashboard"],
    queryFn: () => apiGet<{ data: ArtistReferralDashboard }>("/artist/referrals/dashboard")
      .then(res => res.data),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Artist Referral Link Hook
// ============================================================================

export function useArtistReferralLink() {
  return useQuery({
    queryKey: ["artist", "referrals", "link"],
    queryFn: () => apiGet<{ data: ArtistReferralLink }>("/artist/referrals/link")
      .then(res => res.data),
  });
}

// ============================================================================
// Fan Signups Hook (Artist Referrals Tracking)
// ============================================================================

export function useArtistFanSignups(params?: {
  status?: string;
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ["artist", "referrals", "fans", params],
    queryFn: () => apiGet<{
      data: FanSignup[];
      pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
      stats: {
        total: number;
        active: number;
        pending: number;
        inactive: number;
      };
    }>("/artist/referrals/fans", { params }),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Artist Earnings Share Hook
// ============================================================================

export function useArtistEarningsShare(period?: string) {
  return useQuery({
    queryKey: ["artist", "referrals", "earnings", period],
    queryFn: () => apiGet<{ data: ArtistEarningsShare }>("/artist/referrals/earnings", {
      params: period ? { period } : undefined,
    }).then(res => res.data),
    staleTime: 60 * 1000,
  });
}

// ============================================================================
// Promotional Materials Hook
// ============================================================================

export function useArtistPromoMaterials() {
  return useQuery({
    queryKey: ["artist", "referrals", "promo"],
    queryFn: () => apiGet<{ data: PromoMaterial[] }>("/artist/referrals/promo-materials")
      .then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Generate Promo Material Mutation
// ============================================================================

export function useGeneratePromoMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { type: 'banner' | 'story' | 'post' | 'flyer'; platform: string }) =>
      apiPost<{ data: PromoMaterial }>("/artist/referrals/promo-materials/generate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "referrals", "promo"] });
    },
  });
}

// ============================================================================
// Track Artist Share Mutation
// ============================================================================

export function useTrackArtistShare() {
  return useMutation({
    mutationFn: (platform: 'whatsapp' | 'twitter' | 'facebook' | 'sms' | 'email' | 'copy' | 'qr') =>
      apiPost("/artist/referrals/share", { platform }),
  });
}

// ============================================================================
// Bulk Song Operations
// ============================================================================

export function useBulkDeleteSongs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: number[]) =>
      apiPost("/artist/songs/bulk-delete", { song_ids: songIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "songs"] });
    },
  });
}

export function useBulkUpdateSongStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { song_ids: number[]; status: string }) =>
      apiPost("/artist/songs/bulk-status", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "songs"] });
    },
  });
}

// ============================================================================
// Artist Application / Become-an-Artist
// ============================================================================

export interface ArtistApplicationData {
  // Step 1: Artist Profile
  stage_name: string;
  bio: string;
  primary_genre: string;
  secondary_genres?: string[];
  career_start_year?: number;
  country?: string;
  city?: string;
  website_url?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    spotify?: string;
  };

  // Step 2: Identity Verification
  full_name: string;
  nin_number?: string;
  phone: string;

  // Step 3: Payout Setup
  payout_method: 'mtn_momo' | 'airtel_money' | 'bank' | 'zengapay';
  mobile_money_number?: string;
  mobile_money_provider?: 'mtn' | 'airtel' | 'zengapay';
  bank_name?: string;
  bank_account?: string;

  // Files (handled via FormData)
  avatar?: File;
  national_id_front?: File;
  national_id_back?: File;
  selfie_with_id?: File;

  // Agreement
  terms_accepted: boolean;
  artist_agreement_accepted: boolean;
}

export interface ArtistApplicationResponse {
  message: string;
  data?: {
    application_status: string;
    artist_id: number;
    stage_name: string;
    slug: string;
    submitted_at: string;
  };
  errors?: Record<string, string[]>;
}

export interface ApplicationStatusResponse {
  data: {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    is_artist: boolean;
    artist?: {
      id: number;
      stage_name: string;
      slug: string;
      is_verified?: boolean;
      can_upload?: boolean;
    };
    message?: string;
    submitted_at?: string;
    approved_at?: string;
    rejection_reason?: string;
    can_reapply?: boolean;
  };
}

export interface GenreOption {
  id: string;
  name: string;
  emoji: string;
}

/**
 * Submit an artist application (multipart/form-data for file uploads)
 */
export function useSubmitArtistApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ArtistApplicationData) => {
      const formData = new FormData();
      const normalizedPayoutMethod = data.payout_method;
      const normalizedMobileMoneyNumber =
        normalizedPayoutMethod === "zengapay"
          ? (data.mobile_money_number || data.phone)
          : data.mobile_money_number;
      const normalizedMobileMoneyProvider =
        normalizedPayoutMethod === "mtn_momo"
          ? (data.mobile_money_provider || "mtn")
          : normalizedPayoutMethod === "airtel_money"
            ? (data.mobile_money_provider || "airtel")
            : undefined;

      // Add all text fields
      formData.append('stage_name', data.stage_name);
      formData.append('bio', data.bio);
      formData.append('primary_genre', data.primary_genre);
      formData.append('full_name', data.full_name);
      formData.append('phone', data.phone);
      formData.append('payout_method', normalizedPayoutMethod);
      formData.append('payment_option', normalizedPayoutMethod);
      formData.append('terms_accepted', '1');
      formData.append('artist_agreement_accepted', '1');

      if (data.nin_number) formData.append('nin_number', data.nin_number);
      if (data.career_start_year) formData.append('career_start_year', String(data.career_start_year));
      if (data.country) formData.append('country', data.country);
      if (data.city) formData.append('city', data.city);
      if (data.website_url) formData.append('website_url', data.website_url);
      if (normalizedMobileMoneyNumber) {
        formData.append('mobile_money_number', normalizedMobileMoneyNumber);
      }
      if (normalizedMobileMoneyProvider) {
        formData.append('mobile_money_provider', normalizedMobileMoneyProvider);
      }
      if (data.bank_name) formData.append('bank_name', data.bank_name);
      if (data.bank_account) formData.append('bank_account', data.bank_account);

      // Secondary genres
      if (data.secondary_genres) {
        data.secondary_genres.forEach((genre, i) => {
          formData.append(`secondary_genres[${i}]`, genre);
        });
      }

      // Social links
      if (data.social_links) {
        Object.entries(data.social_links).forEach(([key, value]) => {
          if (value) formData.append(`social_links[${key}]`, value);
        });
      }

      // File uploads - only append if file exists
      if (data.avatar && data.avatar instanceof File) {
        formData.append('avatar', data.avatar);
      }
      if (data.national_id_front && data.national_id_front instanceof File) {
        formData.append('national_id_front', data.national_id_front);
      }
      if (data.national_id_back && data.national_id_back instanceof File) {
        formData.append('national_id_back', data.national_id_back);
      }
      if (data.selfie_with_id && data.selfie_with_id instanceof File) {
        formData.append('selfie_with_id', data.selfie_with_id);
      }

      return apiPostForm<ArtistApplicationResponse>("/artist/apply", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", "application-status"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Check current artist application status
 */
export function useArtistApplicationStatus() {
  const { data: session, status } = useSession();
  const hasApiAccess = session?.user?.apiAuthorized ?? Boolean(session?.user?.accessToken);

  return useQuery({
    queryKey: ["artist", "application-status"],
    queryFn: () => apiGet<ApplicationStatusResponse>("/artist/application-status"),
    staleTime: 30 * 1000, // 30 seconds
    enabled: status === "authenticated" && hasApiAccess,
  });
}

/**
 * Get available genres for the application form
 */
export function useAvailableGenres() {
  return useQuery({
    queryKey: ["artist", "available-genres"],
    queryFn: () => apiGet<{ data: GenreOption[] }>("/genres"),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - genres rarely change
  });
}
