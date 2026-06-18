import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/api";
import { STORE_ENABLED } from "@/lib/features";
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

/**
 * Whether the storefront is live. Prefers the admin-controlled platform setting
 * (`general.store_enabled`) over the build-time `STORE_ENABLED` env flag, so
 * enabling the store from the admin panel takes effect without a redeploy.
 */
export function useStoreEnabled(): boolean {
  const { data } = usePlatformSettings();
  return data?.general?.store_enabled ?? STORE_ENABLED;
}
