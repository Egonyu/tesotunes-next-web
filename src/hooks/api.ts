import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete, apiPostForm } from "@/lib/api";
import { toast } from "sonner";
import type { Song, Artist, Album, Genre, Playlist, PlaylistCollaborator, PaginatedResponse, CatalogClaimRequest } from "@/types";

// ============================================================================
// Songs Hooks
// ============================================================================

export function useSongs(params?: { page?: number; limit?: number; genre?: string }) {
  return useQuery({
    queryKey: ["songs", params],
    queryFn: () => apiGet<PaginatedResponse<Song>>("/songs", { params }),
    retry: 1,
  });
}

export function useSong(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["song", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Song }>(`/songs/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useTrendingSongs(limit = 10) {
  return useQuery({
    queryKey: ["songs", "trending", limit],
    queryFn: () => apiGet<PaginatedResponse<Song>>("/songs", { params: { limit, sort: '-play_count' } }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useNewReleases(limit = 10) {
  return useQuery({
    queryKey: ["songs", "new", limit],
    queryFn: () => apiGet<PaginatedResponse<Song>>("/songs", { params: { limit, sort: '-created_at' } }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecordPlay() {
  return useMutation({
    mutationFn: (data: {
      song_id: number;
      duration_played: number;
      total_duration?: number;
      completed?: boolean;
      seeked_forward?: boolean;
    }) => apiPost<{ credits_earned?: number; message?: string }>(`/player/record-play`, data),
    onSuccess: (res) => {
      if (res?.credits_earned && res.credits_earned > 0) {
        toast.success(`+${res.credits_earned} credits earned for listening!`, {
          duration: 3000,
          icon: "🎵",
        });
      }
    },
  });
}

export function useSavePosition() {
  return useMutation({
    mutationFn: (data: { song_id: number; position_seconds: number }) =>
      apiPost<{ message?: string }>(`/player/save-position`, data),
  });
}

export function useResumePosition(songId: number | null) {
  return useQuery({
    queryKey: ["resume-position", songId],
    queryFn: () =>
      apiGet<{ data: { song_id: number; position_seconds: number } }>(
        `/player/resume-position/${songId}`
      ),
    enabled: !!songId,
    staleTime: 0,
    gcTime: 60 * 1000,
  });
}

// ============================================================================
// Artists Hooks
// ============================================================================

export function useArtists(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["artists", params],
    queryFn: () => apiGet<PaginatedResponse<Artist>>("/artists", { params }),
    retry: 1,
  });
}

export function useClaimableArtistsSearch(query: string) {
  return useQuery({
    queryKey: ["artists", "claimable", query],
    queryFn: async () => {
      const res = await apiGet<PaginatedResponse<Artist>>("/catalog/claimable-artists", {
        params: {
          claimable_only: 1,
          per_page: 24,
          search: query,
        },
      });
      return res.data;
    },
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useSubmitCatalogClaim() {
  return useMutation({
    mutationFn: (data: {
      artist_id: number;
      song_ids?: number[];
      phone_number?: string;
      message: string;
      evidence?: string[];
    }) => apiPost<{ message?: string; data?: unknown }>("/catalog/claim-requests", data),
  });
}

export function useMyCatalogClaims() {
  return useQuery({
    queryKey: ["catalog", "claims", "mine"],
    queryFn: async () => {
      const res = await apiGet<{
        data: {
          data: CatalogClaimRequest[];
        };
      }>("/catalog/claim-requests");
      return res.data.data;
    },
  });
}

export function useArtist(idOrSlug: string | number, options?: { initialData?: Artist }) {
  return useQuery({
    queryKey: ["artist", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Artist }>(`/artists/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
    // Seed with server-fetched data so the artist page renders real content
    // during SSR (fixes Google "soft 404" on client-only rendering).
    initialData: options?.initialData,
  });
}

export function useArtistSongs(artistId: number, params?: { limit?: number; enabled?: boolean }) {
  return useQuery({
    queryKey: ["artist", artistId, "songs", params],
    queryFn: () => apiGet<PaginatedResponse<Song>>(`/artists/${artistId}/songs`, { params: { limit: params?.limit } }),
    enabled: params?.enabled !== false && !!artistId,
  });
}

export function usePublicArtistAlbums(artistId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["artist", artistId, "albums"],
    queryFn: () => apiGet<PaginatedResponse<Album>>(`/artists/${artistId}/albums`),
    enabled: options?.enabled !== false && !!artistId,
  });
}

export function usePopularArtists(limit = 12) {
  return useQuery({
    queryKey: ["artists", "popular", limit],
    queryFn: () => apiGet<PaginatedResponse<Artist>>("/artists", { params: { limit, sort: '-followers_count' } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFollowArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artistId: number) => apiPost(`/artists/${artistId}/follow`),
    onSuccess: (_, artistId) => {
      queryClient.invalidateQueries({ queryKey: ["artist", artistId] });
    },
  });
}

export function useUnfollowArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artistId: number) => apiPost(`/artists/${artistId}/follow`), // Toggle endpoint
    onSuccess: (_, artistId) => {
      queryClient.invalidateQueries({ queryKey: ["artist", artistId] });
    },
  });
}

// ============================================================================
// Albums Hooks
// ============================================================================

export function useAlbums(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["albums", params],
    queryFn: () => apiGet<PaginatedResponse<Album>>("/albums", { params }),
    retry: 1,
  });
}

export function useAlbum(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["album", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Album }>(`/albums/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

// ============================================================================
// Genres Hooks
// ============================================================================

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await apiGet<{ data: Genre[] }>("/genres");
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useGenre(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["genre", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Genre }>(`/genres/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useGenreSongs(genreId: number, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["genre", genreId, "songs", params],
    queryFn: () => apiGet<PaginatedResponse<Song>>(`/genres/${genreId}/songs`, { params }),
    enabled: !!genreId,
  });
}

// ============================================================================
// Playlists Hooks
// ============================================================================

export function usePlaylists(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["playlists", params],
    queryFn: () => apiGet<PaginatedResponse<Playlist>>("/playlists", { params }),
  });
}

export function usePlaylist(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["playlist", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Playlist }>(`/playlists/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useUserPlaylists(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["playlists", "user"],
    queryFn: async () => {
      const res = await apiGet<{ data: Playlist[] }>("/playlists/mine");
      return res.data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; is_public?: boolean; is_collaborative?: boolean; collaboration_requires_approval?: boolean } | FormData) => {
      const res = data instanceof FormData
        ? await apiPostForm<{ data: Playlist }>("/playlists", data)
        : await apiPost<{ data: Playlist }>("/playlists", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", "user"] });
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      data,
    }: {
      playlistId: number | string;
      data: { name?: string; description?: string; is_public?: boolean; is_collaborative?: boolean; collaboration_requires_approval?: boolean; remove_artwork?: boolean } | FormData;
    }) => {
      const res = data instanceof FormData
        ? await apiPostForm<{ data: Playlist }>(`/playlists/${playlistId}`, data)
        : await apiPut<{ data: Playlist }>(`/playlists/${playlistId}`, data);
      return res.data;
    },
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlist.id] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists", "user"] });
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

export function useAddToPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: number | string; songId: number }) =>
      apiPost(`/playlists/${playlistId}/tracks`, { song_id: songId }),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlist"] });
      queryClient.invalidateQueries({ queryKey: ["playlists", "user"] });
    },
  });
}

export function useRemoveFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: number | string; songId: number }) =>
      apiDelete(`/playlists/${playlistId}/songs/${songId}`),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlist"] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistId: number | string) => apiDelete(`/playlists/${playlistId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists", "user"] });
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

export function useRemovePlaylistArtwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistId: number | string) => apiDelete(`/playlists/${playlistId}/artwork`),
    onSuccess: (_, playlistId) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlist"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists", "user"] });
    },
  });
}

export function useReorderPlaylistSongs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songIds }: { playlistId: number | string; songIds: number[] }) =>
      apiPost(`/playlists/${playlistId}/reorder`, { song_ids: songIds }),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlist"] });
    },
  });
}

export function useSuggestedPlaylistSongs(playlistId: number | string, options?: { enabled?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["playlist", playlistId, "suggested-songs", options?.limit],
    queryFn: async () => {
      const res = await apiGet<{ data: Song[] }>(`/playlists/${playlistId}/suggested-songs`, {
        params: { limit: options?.limit ?? 8 },
      });
      return res.data;
    },
    enabled: (options?.enabled ?? true) && !!playlistId,
  });
}

export function useGeneratePlaylistInviteLink() {
  return useMutation({
    mutationFn: ({ playlistId, expiresInHours }: { playlistId: number | string; expiresInHours?: number }) =>
      apiPost<{ data: { invite_token: string; invite_url: string; expires_at?: string | null; requires_approval: boolean } }>(`/playlists/${playlistId}/invite-link`, {
        expires_in_hours: expiresInHours,
      }),
  });
}

export function useJoinPlaylistInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => apiPost(`/playlists/invites/${token}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", "user"] });
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

export function usePlaylistInvitePreview(token: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["playlist", "invite-preview", token],
    queryFn: () => apiGet<{ data: { playlist: Playlist; requires_approval: boolean; expires_at?: string | null; membership?: { status: string; role: string } | null } }>(`/playlists/invites/${token}`),
    enabled: (options?.enabled ?? true) && !!token,
    retry: false,
  });
}

export function usePlaylistCollaborators(playlistId: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["playlist-collaborators", playlistId],
    queryFn: async () => {
      const res = await apiGet<{ data: PlaylistCollaborator[] }>(`/playlists/${playlistId}/collaborators`);
      return res.data;
    },
    enabled: (options?.enabled ?? true) && !!playlistId,
  });
}

// ============================================================================
// Search Hooks
// ============================================================================

export function useSearch(query: string, type?: "songs" | "artists" | "albums" | "playlists") {
  return useQuery({
    queryKey: ["search", query, type],
    queryFn: async () => {
      const res = await apiGet<{
        data: {
          songs?: Song[];
          artists?: Artist[];
          albums?: Album[];
          playlists?: Playlist[];
        };
      }>("/search", { params: { q: query, type } });
      return res.data;
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// User Library Hooks
// ============================================================================

export function useLikedSongs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["library", "liked", params],
    queryFn: async () => {
      const res = await apiGet<{ data: { liked_songs: Song[] } }>("/user/library");
      const songs = res.data?.liked_songs ?? [];
      const limit = params?.limit ?? songs.length;
      return {
        data: songs.slice(0, limit),
        meta: { total: songs.length, current_page: 1, last_page: 1 },
      } as PaginatedResponse<Song>;
    },
  });
}

export function useLikeSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: number) => apiPost(`/songs/${songId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "liked"] });
    },
  });
}

export function useUnlikeSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: number) => apiDelete(`/songs/${songId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "liked"] });
    },
  });
}

export function useRecentlyPlayed(limit = 10) {
  return useQuery({
    queryKey: ["library", "recent", limit],
    queryFn: async () => {
      const res = await apiGet<{ data: Song[] }>("/history", { params: { limit } });
      return res.data;
    },
  });
}

export function useFollowedArtists() {
  return useQuery({
    queryKey: ["library", "artists"],
    queryFn: async () => {
      const res = await apiGet<{ data: { followed_artists: Artist[] } }>("/user/library");
      return res.data?.followed_artists ?? [];
    },
  });
}

// Combined library hook for all user data
export function useLibrary() {
  const libraryQuery = useQuery({
    queryKey: ["user-library"],
    queryFn: async () => {
      const res = await apiGet<{
        data: {
          liked_songs: Song[];
          playlists: Playlist[];
          followed_artists: Artist[];
          downloads: Song[];
        };
      }>("/user/library");
      return res.data;
    },
  });

  const data = libraryQuery.data;

  return {
    playlists: data?.playlists ?? [],
    likedSongs: data?.liked_songs ?? [],
    savedAlbums: [] as Album[], // not yet supported by backend
    followedArtists: data?.followed_artists ?? [],
    isLoading: libraryQuery.isLoading,
    error: libraryQuery.error,
  };
}

// ============================================================================
// Song Purchase Hooks
// ============================================================================

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    purchase_id: number;
    credits_deducted: number;
    credits_remaining: number;
    payment?: {
      id: number;
      reference: string;
      status: string;
      amount: number;
      currency: string;
    };
    distribution?: {
      artist_name?: string;
      artist_percentage: number;
      platform_percentage: number;
      artist_amount: number;
      platform_amount: number;
    };
    benefits?: {
      download_access: boolean;
      loyalty_points_awarded?: number;
      loyalty_points_balance?: number | null;
    };
    artist_wallet?: {
      current_balance: number;
    };
    payment_status?: string;
    payment_reference?: string;
  };
}

export interface PurchaseSongPayload {
  payment_method?: 'platform_credits' | 'zengapay';
  phone_number?: string;
}

export interface SongPurchasePaymentStatusResponse {
  success: boolean;
  message?: string;
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'not_found';
    reference: string;
    amount?: number;
    currency?: string;
    purchased: boolean;
    download_access: boolean;
    song_id: number;
    payment_id?: number;
    completed_at?: string | null;
    failed_at?: string | null;
    message?: string;
  };
}

export function useCheckPurchase(songId: number) {
  return useQuery({
    queryKey: ["song", "purchase", songId],
    queryFn: () =>
      apiGet<{ data: { purchased: boolean } }>(`/songs/${songId}/purchase-status`).then(
        (res) => res.data.purchased
      ),
    enabled: songId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, payload }: { songId: number; payload?: PurchaseSongPayload }) =>
      apiPost<PurchaseResponse>(`/songs/${songId}/purchase`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["song", "purchase", variables.songId] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useSongPurchasePaymentStatus(songId: number, reference: string | null, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['song', 'purchase', 'payment-status', songId, reference],
    queryFn: () => apiGet<SongPurchasePaymentStatusResponse>(`/songs/${songId}/purchase/payment-status/${reference}`),
    enabled: songId > 0 && !!reference && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval ?? 3000,
    refetchIntervalInBackground: false,
  });
}

// ============================================================================
// Tip Hooks
// ============================================================================

export interface TipResponse {
  success: boolean;
  message: string;
  data?: {
    tip_id: number;
    amount: number;
    credits_remaining: number;
  };
}

export function useSendTip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      recipient_id: number;
      recipient_type: 'artist' | 'song';
      amount: number;
      message?: string;
    }) => apiPost<TipResponse>("/tips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}
