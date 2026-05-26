import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import {
  defaultPlatformSettings,
  normalizePlatformSettings,
  type PlatformSettings,
} from "@/lib/platform-settings";

interface PublicSettingsRow {
  key: string;
  group: string;
  subgroup: string | null;
  value: unknown;
}

interface PublicSettingsResponse {
  data: PublicSettingsRow[];
}

/**
 * Reshape the registry's flat public payload back into the legacy
 * nested PlatformSettings shape so existing consumers keep working
 * without changes. Mapping rules:
 *
 *  - `general_*` / `appearance_*` flat keys → `general.*` / `appearance.*`
 *  - `auth_{provider}_login_enabled` → `security.{provider}_login_enabled`
 *    (legacy nested key the login page reads)
 *  - `users_social_login_enabled` → `users.social_login_enabled`
 *  - `sacco_*` not used by PlatformSettings consumers today; ignored here.
 */
function reshape(rows: PublicSettingsRow[]): Partial<PlatformSettings> {
  const general: Record<string, unknown> = {};
  const appearance: Record<string, unknown> = {};
  const users: Record<string, unknown> = {};
  const security: Record<string, unknown> = {};

  for (const row of rows) {
    if (row.key.startsWith("general_")) {
      general[row.key.slice("general_".length)] = row.value;
      continue;
    }
    if (row.key.startsWith("appearance_")) {
      appearance[row.key.slice("appearance_".length)] = row.value;
      continue;
    }
    if (row.key === "users_social_login_enabled") {
      users.social_login_enabled = row.value;
      continue;
    }
    if (
      row.key === "auth_google_login_enabled" ||
      row.key === "auth_facebook_login_enabled" ||
      row.key === "auth_apple_login_enabled"
    ) {
      security[row.key.slice("auth_".length)] = row.value;
      continue;
    }
  }

  return {
    general: general as PlatformSettings["general"],
    appearance: appearance as PlatformSettings["appearance"],
    users: users as PlatformSettings["users"],
    security: security as PlatformSettings["security"],
  };
}

export function usePublicPlatformSettings() {
  return useQuery({
    queryKey: ["public-platform-settings"],
    queryFn: async (): Promise<PlatformSettings> => {
      try {
        const res = await apiGet<PublicSettingsResponse>("/settings/public");
        return normalizePlatformSettings(reshape(res.data));
      } catch {
        return defaultPlatformSettings;
      }
    },
    staleTime: 0,
    retry: 1,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
