"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { HomepageMode, HomepageResponse } from "@/types/homepage";

interface HomepageApiResponse {
  success?: boolean;
  data: HomepageResponse;
}

export function useHomepageRecommendations(
  mode: HomepageMode = "all"
) {
  return useQuery({
    queryKey: ["homepage", mode],
    queryFn: async () => {
      const response = await apiGet<HomepageApiResponse>("/homepage", {
        params: { mode },
      });

      return response.data;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useCuratedHomepage(mode: HomepageMode = "all") {
  return useHomepageRecommendations(mode);
}
