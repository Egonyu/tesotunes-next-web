import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/api";

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

// ============================================================================
// Get All Settings Hook
// ============================================================================

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<{ success: boolean; data: AllSettings }>("/settings")
      .then(res => res.data),
  });
}

// ============================================================================
// Update All Settings Hook
// ============================================================================

export function useUpdateAllSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AllSettings>) =>
      apiPut<{ success: boolean; message: string }>("/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// ============================================================================
// Individual Section Update Hooks
// ============================================================================

export function useUpdateProfileSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Omit<ProfileSettings, 'display_name'>>) =>
      apiPut<{ success: boolean; message: string }>("/settings/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      apiPut<{ success: boolean; message: string }>("/settings/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateAudioSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AudioSettings>) =>
      apiPut<{ success: boolean; message: string }>("/settings/audio", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateDownloadSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<DownloadSettings>) =>
      apiPut<{ success: boolean; message: string }>("/settings/downloads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PrivacySettings>) =>
      apiPut<{ success: boolean; message: string }>("/settings/privacy", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateAppearanceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AppearanceSettings & LanguageSettings>) =>
      apiPut<{ success: boolean; message: string }>("/settings/appearance", data),
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
