const SOCIAL_PROVIDER_IDS = ["google", "facebook", "twitter", "apple"] as const;

export type SocialProviderId = (typeof SOCIAL_PROVIDER_IDS)[number];

interface SocialProviderPlatformSettings {
  users?: {
    social_login_enabled?: boolean;
  };
  security?: {
    google_login_enabled?: boolean;
    facebook_login_enabled?: boolean;
    apple_login_enabled?: boolean;
  };
}

const DEFAULT_SOCIAL_PROVIDER_IDS: SocialProviderId[] = ["google"];

function parseProviderCsv(value: string | undefined | null): SocialProviderId[] {
  if (!value) {
    return DEFAULT_SOCIAL_PROVIDER_IDS;
  }

  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is SocialProviderId =>
      (SOCIAL_PROVIDER_IDS as readonly string[]).includes(item)
    );

  return parsed.length > 0 ? parsed : DEFAULT_SOCIAL_PROVIDER_IDS;
}

export function getEnabledSocialAuthProviders(explicitValue?: string | null): Set<SocialProviderId> {
  const rawValue =
    explicitValue ??
    process.env.AUTH_SOCIAL_PROVIDERS ??
    process.env.NEXT_PUBLIC_AUTH_SOCIAL_PROVIDERS;

  return new Set(parseProviderCsv(rawValue));
}

export function getEnabledSocialAuthProvidersForPlatformSettings(
  settings?: SocialProviderPlatformSettings | null,
  explicitValue?: string | null
): Set<SocialProviderId> {
  const envEnabledProviders = getEnabledSocialAuthProviders(explicitValue);

  if (!settings) {
    return envEnabledProviders;
  }

  if (settings.users?.social_login_enabled === false) {
    return new Set<SocialProviderId>();
  }

  const filtered = new Set<SocialProviderId>();

  envEnabledProviders.forEach((providerId) => {
    if (providerId === "google" && settings.security?.google_login_enabled === false) {
      return;
    }

    if (providerId === "facebook" && settings.security?.facebook_login_enabled === false) {
      return;
    }

    if (providerId === "apple" && settings.security?.apple_login_enabled === false) {
      return;
    }

    filtered.add(providerId);
  });

  return filtered;
}

export function isSocialAuthProviderEnabled(
  providerId: SocialProviderId,
  explicitValue?: string | null
): boolean {
  return getEnabledSocialAuthProviders(explicitValue).has(providerId);
}

export function isSocialAuthProviderEnabledForPlatformSettings(
  providerId: SocialProviderId,
  settings?: SocialProviderPlatformSettings | null,
  explicitValue?: string | null
): boolean {
  return getEnabledSocialAuthProvidersForPlatformSettings(settings, explicitValue).has(providerId);
}
