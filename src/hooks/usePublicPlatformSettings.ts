import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import {
  defaultPlatformSettings,
  normalizePlatformSettings,
  type PlatformSettings,
} from "@/lib/platform-settings";

interface PlatformSettingsResponse {
  data?: Partial<PlatformSettings>;
}

export function usePublicPlatformSettings() {
  return useQuery({
    queryKey: ["public-platform-settings"],
    queryFn: async (): Promise<PlatformSettings> => {
      try {
        const res = await apiGet<PlatformSettingsResponse>("/platform-settings");
        return normalizePlatformSettings(res.data);
      } catch {
        return defaultPlatformSettings;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
