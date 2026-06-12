const DEFAULT_SITE_URL = "https://www.tesotunes.com";

function normalizeInput(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getSiteUrl(rawUrl?: string | null): string {
  const candidate = normalizeInput(rawUrl || DEFAULT_SITE_URL);

  try {
    const parsed = new URL(candidate);

    if (parsed.hostname === "tesotunes.com") {
      parsed.hostname = "www.tesotunes.com";
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteOrigin(rawUrl?: string | null): URL {
  return new URL(getSiteUrl(rawUrl));
}

export function absoluteUrl(path = "/", rawUrl?: string | null): string {
  return new URL(path, `${getSiteUrl(rawUrl)}/`).toString();
}

export const SITE_URL = getSiteUrl(process.env.NEXT_PUBLIC_APP_URL);
