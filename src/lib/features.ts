function parseEnvFlag(value: string | undefined, fallback = false): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(normalized);
}

export const STORE_ENABLED = parseEnvFlag(
  process.env.NEXT_PUBLIC_STORE_ENABLED ?? process.env.NEXT_PUBLIC_ENABLE_STORE,
  false
);

export const ADS_ENABLED = parseEnvFlag(
  process.env.NEXT_PUBLIC_ENABLE_ADS,
  false
);

export const FEATURED_CONTENT_ENABLED = parseEnvFlag(
  process.env.NEXT_PUBLIC_ENABLE_FEATURED,
  true
);
