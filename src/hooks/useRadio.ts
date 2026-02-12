import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  description: string;
  image: string;
  listeners: number;
  isLive: boolean;
  stream_url?: string;
}

// ============================================================================
// Hooks
// ============================================================================

export function useRadioStations() {
  return useQuery({
    queryKey: ["radio", "stations"],
    queryFn: async () => {
      try {
        const response = await apiGet<{ data: RadioStation[] }>("/api/radio/stations");
        return response.data;
      } catch {
        // Return default stations as fallback when API is unavailable
        return getDefaultStations();
      }
    },
  });
}

export function useFeaturedStation() {
  return useQuery({
    queryKey: ["radio", "featured"],
    queryFn: async () => {
      try {
        const response = await apiGet<{ data: RadioStation }>("/api/radio/stations/featured");
        return response.data;
      } catch {
        return getDefaultStations()[0];
      }
    },
  });
}

// ============================================================================
// Default Stations (fallback when API unavailable)
// ============================================================================

function getDefaultStations(): RadioStation[] {
  return [
    {
      id: "1",
      name: "TesoTunes Hits",
      genre: "Pop",
      description: "The hottest tracks from around the world",
      image: "/images/radio/hits.jpg",
      listeners: 12543,
      isLive: true,
    },
    {
      id: "2",
      name: "Afrobeats Central",
      genre: "Afrobeats",
      description: "Non-stop Afrobeats from Africa and beyond",
      image: "/images/radio/afrobeats.jpg",
      listeners: 8921,
      isLive: true,
    },
    {
      id: "3",
      name: "Chill Vibes",
      genre: "Lo-fi / Chill",
      description: "Relaxing beats to study and work to",
      image: "/images/radio/chill.jpg",
      listeners: 6432,
      isLive: true,
    },
    {
      id: "4",
      name: "Gospel Hour",
      genre: "Gospel",
      description: "Uplifting gospel music 24/7",
      image: "/images/radio/gospel.jpg",
      listeners: 4521,
      isLive: true,
    },
    {
      id: "5",
      name: "Throwback Jams",
      genre: "Classics",
      description: "The best hits from the past decades",
      image: "/images/radio/throwback.jpg",
      listeners: 5678,
      isLive: true,
    },
    {
      id: "6",
      name: "Hip Hop Nation",
      genre: "Hip Hop",
      description: "From old school to new school hip hop",
      image: "/images/radio/hiphop.jpg",
      listeners: 7890,
      isLive: true,
    },
  ];
}
