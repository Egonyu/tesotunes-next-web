import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Album, PaginatedResponse } from "@/types";

type RadioAvailabilityResponse = {
  data: Array<unknown>;
};

function getAlbumTotal(response?: PaginatedResponse<Album> | null) {
  if (!response) {
    return 0;
  }

  if (typeof response.meta?.total === "number") {
    return response.meta.total;
  }

  return Array.isArray(response.data) ? response.data.length : 0;
}

export function useNavigationAvailability() {
  const albumsQuery = useQuery({
    queryKey: ["navigation", "availability", "albums"],
    queryFn: () => apiGet<PaginatedResponse<Album>>("/albums", { params: { limit: 1 } }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const radioQuery = useQuery({
    queryKey: ["navigation", "availability", "radio"],
    queryFn: () => apiGet<RadioAvailabilityResponse>("/radio/stations", { params: { limit: 1 } }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return useMemo(() => {
    const albumCount = getAlbumTotal(albumsQuery.data);
    const radioCount = Array.isArray(radioQuery.data?.data) ? radioQuery.data.data.length : 0;

    return {
      hasAlbums: albumCount > 0,
      hasRadioStations: radioCount > 0,
      isLoading: albumsQuery.isLoading || radioQuery.isLoading,
    };
  }, [albumsQuery.data, albumsQuery.isLoading, radioQuery.data, radioQuery.isLoading]);
}
