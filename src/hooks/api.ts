import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Song, Artist, Album, Genre, Playlist, PaginatedResponse } from "@/types";

// ============================================================================
// Songs Hooks
// ============================================================================

export function useSongs(params?: { page?: number; limit?: number; genre?: string }) {
  return useQuery({
    queryKey: ["songs", params],
    queryFn: () => apiGet<PaginatedResponse<Song>>("/api/songs", { params }),
    retry: 1,
  });
}

export function useSong(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["song", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Song }>(`/api/songs/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useTrendingSongs(limit = 10) {
  return useQuery({
    queryKey: ["songs", "trending", limit],
    queryFn: () => apiGet<PaginatedResponse<Song>>("/api/songs", { params: { limit, sort: '-play_count' } }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useNewReleases(limit = 10) {
  return useQuery({
    queryKey: ["songs", "new", limit],
    queryFn: () => apiGet<PaginatedResponse<Song>>("/api/songs", { params: { limit, sort: '-created_at' } }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecordPlay() {
  return useMutation({
    mutationFn: (songId: number) => apiPost(`/api/player/record-play`, { song_id: songId }),
  });
}

// ============================================================================
// Artists Hooks
// ============================================================================

export function useArtists(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["artists", params],
    queryFn: () => apiGet<PaginatedResponse<Artist>>("/api/artists", { params }),
    retry: 1,
  });
}

export function useArtist(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["artist", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Artist }>(`/api/artists/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useArtistSongs(artistId: number, params?: { limit?: number }) {
  return useQuery({
    queryKey: ["artist", artistId, "songs", params],
    queryFn: () => apiGet<PaginatedResponse<Song>>(`/api/artists/${artistId}/songs`, { params }),
    enabled: !!artistId,
  });
}

export function usePopularArtists(limit = 12) {
  return useQuery({
    queryKey: ["artists", "popular", limit],
    queryFn: () => apiGet<PaginatedResponse<Artist>>("/api/artists", { params: { limit, sort: '-followers_count' } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFollowArtist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (artistId: number) => apiPost(`/api/artists/${artistId}/follow`),
    onSuccess: (_, artistId) => {
      queryClient.invalidateQueries({ queryKey: ["artist", artistId] });
    },
  });
}

export function useUnfollowArtist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (artistId: number) => apiPost(`/api/artists/${artistId}/follow`), // Toggle endpoint
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
    queryFn: () => apiGet<PaginatedResponse<Album>>("/api/albums", { params }),
    retry: 1,
  });
}

export function useAlbum(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["album", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Album }>(`/api/albums/${idOrSlug}`);
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
      const res = await apiGet<{ data: Genre[] }>("/api/genres");
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useGenre(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["genre", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Genre }>(`/api/genres/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useGenreSongs(genreId: number, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["genre", genreId, "songs", params],
    queryFn: () => apiGet<PaginatedResponse<Song>>(`/api/genres/${genreId}/songs`, { params }),
    enabled: !!genreId,
  });
}

// ============================================================================
// Playlists Hooks
// ============================================================================

export function usePlaylists(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["playlists", params],
    queryFn: () => apiGet<PaginatedResponse<Playlist>>("/api/playlists", { params }),
  });
}

export function usePlaylist(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["playlist", idOrSlug],
    queryFn: async () => {
      const res = await apiGet<{ data: Playlist }>(`/api/playlists/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useUserPlaylists() {
  return useQuery({
    queryKey: ["playlists", "user"],
    queryFn: async () => {
      const res = await apiGet<{ data: Playlist[] }>("/api/playlists");
      return res.data;
    },
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; is_public?: boolean }) => {
      const res = await apiPost<{ data: Playlist }>("/api/playlists", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", "user"] });
    },
  });
}

export function useAddToPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: number; songId: number }) =>
      apiPost(`/api/playlists/${playlistId}/songs`, { song_id: songId }),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
}

export function useRemoveFromPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: number; songId: number }) =>
      apiDelete(`/api/playlists/${playlistId}/songs/${songId}`),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
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
      }>("/api/search", { params: { q: query, type } });
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
    queryFn: () => apiGet<PaginatedResponse<Song>>("/api/library/songs", { params }),
  });
}

export function useLikeSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (songId: number) => apiPost(`/api/songs/${songId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "liked"] });
    },
  });
}

export function useUnlikeSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (songId: number) => apiDelete(`/api/songs/${songId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "liked"] });
    },
  });
}

export function useRecentlyPlayed(limit = 10) {
  return useQuery({
    queryKey: ["library", "recent", limit],
    queryFn: async () => {
      const res = await apiGet<{ data: Song[] }>("/api/history", { params: { limit } });
      return res.data;
    },
  });
}

export function useFollowedArtists() {
  return useQuery({
    queryKey: ["library", "artists"],
    queryFn: async () => {
      const res = await apiGet<{ data: Artist[] }>("/api/library/artists");
      return res.data;
    },
  });
}

// Combined library hook for all user data
export function useLibrary() {
  const playlistsQuery = useQuery({
    queryKey: ["library", "playlists"],
    queryFn: async () => {
      const res = await apiGet<{ data: Playlist[] }>("/api/playlists");
      return res.data;
    },
  });

  const likedSongsQuery = useQuery({
    queryKey: ["library", "liked-songs"],
    queryFn: async () => {
      const res = await apiGet<{ data: Song[] }>("/api/library/songs");
      return res.data;
    },
  });

  const savedAlbumsQuery = useQuery({
    queryKey: ["library", "saved-albums"],
    queryFn: async () => {
      const res = await apiGet<{ data: Album[] }>("/api/library/albums");
      return res.data;
    },
  });

  const followedArtistsQuery = useQuery({
    queryKey: ["library", "followed-artists"],
    queryFn: async () => {
      const res = await apiGet<{ data: Artist[] }>("/api/library/artists");
      return res.data;
    },
  });

  return {
    playlists: playlistsQuery.data || [],
    likedSongs: likedSongsQuery.data || [],
    savedAlbums: savedAlbumsQuery.data || [],
    followedArtists: followedArtistsQuery.data || [],
    isLoading:
      playlistsQuery.isLoading ||
      likedSongsQuery.isLoading ||
      savedAlbumsQuery.isLoading ||
      followedArtistsQuery.isLoading,
    error:
      playlistsQuery.error ||
      likedSongsQuery.error ||
      savedAlbumsQuery.error ||
      followedArtistsQuery.error,
  };
}

