import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/api";
import {
  defaultPlatformSettings,
  normalizePlatformSettings,
  type PlatformSettings,
} from "@/lib/platform-settings";

interface PlatformSettingsResponse {
  data?: Partial<PlatformSettings>;
}

export function usePlatformSettings() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? '';
  const isAdmin = ['admin', 'super_admin'].some((r) =>
    userRole.toLowerCase().includes(r)
  );

  return useQuery({
    queryKey: ["platform-settings"],
    queryFn: async (): Promise<PlatformSettings> => {
      try {
        const res = await apiGet<PlatformSettingsResponse>("/admin/settings");
        return normalizePlatformSettings(res.data);
      } catch {
        return defaultPlatformSettings;
      }
    },
    enabled: isAdmin,
    placeholderData: defaultPlatformSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
