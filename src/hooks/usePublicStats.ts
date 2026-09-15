import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

/** Mirrors GET /api/public/stats (cached hourly on the API). */
export interface PublicStats {
  songs: number;
  artists: number;
  members: number;
}

/**
 * Real catalogue and community counts for marketing surfaces.
 *
 * Returns null when unavailable — callers hide the figures rather than fall
 * back to invented ones, which is what "10K+ songs" and "50K+ users" were.
 */
export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async (): Promise<PublicStats | null> => {
      try {
        const res = await apiGet<{ data: PublicStats | null }>("/public/stats");
        return res.data;
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}
