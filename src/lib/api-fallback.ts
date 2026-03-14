import { API_URL } from "./api-config";

const LOCAL_API_FALLBACK_BASE_URLS = [
  "http://localhost:8000/api",
  "http://127.0.0.1:8000/api",
];

function normalizeApiBaseUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const base = `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
    return base.endsWith("/api") ? base : `${base}/api`;
  } catch {
    return null;
  }
}

function shouldIncludeLocalFallbacks(baseUrl: string): boolean {
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const hostname = new URL(baseUrl).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".test");
  } catch {
    return false;
  }
}

export function buildLocalApiBaseUrls(primaryBaseUrl: string = API_URL): string[] {
  const primary = normalizeApiBaseUrl(primaryBaseUrl);
  const fallbacks = shouldIncludeLocalFallbacks(primaryBaseUrl)
    ? LOCAL_API_FALLBACK_BASE_URLS
    : [];

  return [primary, ...fallbacks.map(normalizeApiBaseUrl)]
    .filter((value): value is string => Boolean(value))
    .filter((value, index, array) => array.indexOf(value) === index);
}

function buildApiRequestUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function isRetryableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /fetch failed|failed to fetch|econnrefused|network/i.test(error.message);
}

export async function fetchApiWithFallback(
  path: string,
  init: RequestInit,
  options?: {
    baseUrls?: string[];
  }
): Promise<Response> {
  const baseUrls = options?.baseUrls ?? buildLocalApiBaseUrls();
  let lastError: unknown;

  for (const baseUrl of baseUrls) {
    try {
      return await fetch(buildApiRequestUrl(baseUrl, path), init);
    } catch (error) {
      lastError = error;

      if (!isRetryableNetworkError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("fetch failed");
}
