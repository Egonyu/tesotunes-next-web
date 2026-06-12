import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut, apiPostForm } from "@/lib/api";
import { useSession } from "next-auth/react";

// ============================================================================
// Types
// ============================================================================

export interface ProfileSettings {
  display_name: string;
  public_profile: boolean;
  show_listening_activity: boolean;
  show_followers: boolean;
  show_following: boolean;
}

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  new_music: boolean;
  artist_updates: boolean;
  playlist_updates: boolean;
  social_updates: boolean;
  promotional: boolean;
  referral_updates: boolean;
}

export interface AudioSettings {
  quality_wifi: 'low' | 'normal' | 'high' | 'very_high';
  quality_mobile: 'low' | 'normal' | 'high' | 'very_high';
  download_quality: 'low' | 'normal' | 'high' | 'very_high';
  crossfade_enabled: boolean;
  crossfade_duration: number;
  gapless_playback: boolean;
  normalize_volume: boolean;
  equalizer_preset: string;
}

export interface DownloadSettings {
  wifi_only: boolean;
  auto_download_liked: boolean;
  storage_limit_mb: number;
}

export interface PrivacySettings {
  data_collection: boolean;
  personalized_ads: boolean;
  share_listening_data: boolean;
}

export interface LanguageSettings {
  app_language: string;
  content_language: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
}

export interface AllSettings {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  audio: AudioSettings;
  downloads: DownloadSettings;
  privacy: PrivacySettings;
  language: LanguageSettings;
  appearance: AppearanceSettings;
}

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  username?: string | null;
  bio?: string | null;
  website?: string | null;
  avatar_url?: string | null;
}

// ============================================================================
// Get All Settings Hook
// ============================================================================

export function useSettings() {
  const { status } = useSession();

  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<{ data: AllSettings }>("/settings")
      .then(res => res.data),
    enabled: status === "authenticated",
    retry: false,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => apiGet<{ data?: UserProfile } & UserProfile>("/user/profile")
      .then((res) => (res.data ?? res) as UserProfile),
  });
}

// ============================================================================
// Update All Settings Hook
// ============================================================================

export function useUpdateAllSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AllSettings>) =>
      apiPut<{ message: string }>("/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// ============================================================================
// Update Audio Quality — optimistic so the player reacts immediately
// ============================================================================

export function useUpdateAudioQuality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quality: AudioSettings['quality_wifi']) =>
      apiPut<{ message: string }>("/settings", { audio: { quality_wifi: quality, quality_mobile: quality } }),
    onMutate: async (quality) => {
      await queryClient.cancelQueries({ queryKey: ['settings'] });
      const prev = queryClient.getQueryData<AllSettings>(['settings']);
      if (prev) {
        queryClient.setQueryData<AllSettings>(['settings'], {
          ...prev,
          audio: { ...prev.audio, quality_wifi: quality, quality_mobile: quality },
        });
      }
      return { prev };
    },
    onError: (_err, _quality, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['settings'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// ============================================================================
// Quality utility: map quality slug to kbps and back
// ============================================================================

export const QUALITY_LEVELS: { slug: AudioSettings['quality_wifi']; label: string; kbps: number }[] = [
  { slug: 'low',       label: 'Low',       kbps: 64  },
  { slug: 'normal',    label: 'Normal',    kbps: 128 },
  { slug: 'high',      label: 'High',      kbps: 256 },
  { slug: 'very_high', label: 'Very High', kbps: 320 },
];

export function qualitySlugToKbps(slug: AudioSettings['quality_wifi']): number {
  return QUALITY_LEVELS.find((q) => q.slug === slug)?.kbps ?? 128;
}

export function kbpsToQualitySlug(kbps: number): AudioSettings['quality_wifi'] {
  if (kbps >= 320) return 'very_high';
  if (kbps >= 256) return 'high';
  if (kbps >= 128) return 'normal';
  return 'low';
}

// ============================================================================
// Individual Section Update Hooks
// ============================================================================

export function useUpdateProfileSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      bio?: string | null;
      website?: string | null;
      phone?: string | null;
      location?: string | null;
      date_of_birth?: string | null;
      gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    }) => apiPut<{ message?: string; data?: UserProfile }>("/user", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiPostForm<{
        success: boolean;
        message: string;
        data?: {
          path: string;
          url: string;
          thumbnails?: Record<string, string>;
        };
      }>("/uploads/avatar", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      apiPut<{ message: string }>("/settings/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateAudioSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AudioSettings>) =>
      apiPut<{ message: string }>("/settings/audio", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateDownloadSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<DownloadSettings>) =>
      apiPut<{ message: string }>("/settings/downloads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PrivacySettings>) =>
      apiPut<{ message: string }>("/settings/privacy", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateAppearanceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AppearanceSettings & LanguageSettings>) =>
      apiPut<{ message: string }>("/settings/appearance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Also invalidate theme if theme was changed
    },
  });
}

// ============================================================================
// Helper: Get audio quality label
// ============================================================================

export function getAudioQualityLabel(quality: string): string {
  switch (quality) {
    case 'low': return 'Low (64 kbps)';
    case 'normal': return 'Normal (128 kbps)';
    case 'high': return 'High (256 kbps)';
    case 'very_high': return 'Very High (320 kbps)';
    default: return quality;
  }
}

// ============================================================================
// Helper: Format storage size
// ============================================================================

export function formatStorageSize(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
}
