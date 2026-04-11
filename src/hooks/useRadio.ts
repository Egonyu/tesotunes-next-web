import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Song } from "@/types";

// ============================================================================
// Types
// ============================================================================

export interface RadioStation {
  id: string;
  name: string;
  slug: string;
  genre: string;
  description: string;
  image: string;
  listeners: number;
  isLive: boolean;
  stream_url?: string;
  href: string;
  curator?: string;
  songsCount?: number;
}

interface RadioStationsApiStation {
  id: number | string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  artwork?: string | null;
  image?: string | null;
  curator?: string | null;
  songs_count?: number | null;
  play_count?: number | null;
  is_featured?: boolean;
  slug?: string | null;
}

function normalizeRadioStation(station: RadioStationsApiStation): RadioStation {
  const id = String(station.id);
  const name = station.name || station.title || "Radio station";
  const songsCount = Number(station.songs_count ?? 0);
  const listeners = Number(station.play_count ?? songsCount * 23);
  const curator = station.curator || "Tesotunes";

  return {
    id,
    name,
    slug: station.slug || id,
    genre: station.is_featured ? "Featured station" : `Curated by ${curator}`,
    description:
      station.description ||
      `${songsCount > 0 ? `${songsCount} songs` : "Fresh selections"} tuned for a lean-back listening session.`,
    image: station.artwork || station.image || "",
    listeners,
    isLive: Boolean(station.is_featured),
    href: `/playlists/${station.slug || id}`,
    curator,
    songsCount,
  };
}

// ============================================================================
// Hooks
// ============================================================================

export function useRadioStations() {
  return useQuery({
    queryKey: ["radio", "stations"],
    queryFn: async () => {
      const response = await apiGet<{ data: RadioStationsApiStation[] }>("/radio/stations");
      return response.data.map(normalizeRadioStation);
    },
  });
}

export function useFeaturedStation() {
  return useQuery({
    queryKey: ["radio", "featured"],
    queryFn: async () => {
      const response = await apiGet<{ data: RadioStationsApiStation[] }>("/radio/stations", {
        params: { limit: 6 },
      });

      return response.data.map(normalizeRadioStation)[0] ?? null;
    },
  });
}

export async function fetchRadioStationTracks(stationId: string) {
  const response = await apiGet<{ data: Song[] }>(`/playlists/${stationId}/tracks`, {
    params: { limit: 24 },
  });

  return response.data;
}

export function useRadioStationTracks(stationId?: string | null) {
  return useQuery({
    queryKey: ["radio", "station", stationId, "tracks"],
    queryFn: async () => {
      if (!stationId) {
        return [] as Song[];
      }

      return fetchRadioStationTracks(stationId);
    },
    enabled: Boolean(stationId),
    staleTime: 2 * 60 * 1000,
  });
}
