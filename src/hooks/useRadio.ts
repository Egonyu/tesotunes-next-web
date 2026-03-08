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
      const response = await apiGet<{ data: RadioStation[] }>("/radio/stations");
      return response.data;
    },
  });
}

export function useFeaturedStation() {
  return useQuery({
    queryKey: ["radio", "featured"],
    queryFn: async () => {
      const response = await apiGet<{ data: RadioStation }>("/radio/stations/featured");
      return response.data;
    },
  });
}
