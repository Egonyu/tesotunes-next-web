import { API_ORIGIN } from "@/lib/api-config";

function normalizeCandidate(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const lowered = trimmed.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return null;

  return trimmed;
}

export function resolveMediaUrl(value?: string | null): string | null {
  const candidate = normalizeCandidate(value);
  if (!candidate) return null;

  if (
    candidate.startsWith("data:") ||
    candidate.startsWith("blob:") ||
    candidate.startsWith("http://") ||
    candidate.startsWith("https://")
  ) {
    return candidate;
  }

  if (candidate.startsWith("//")) {
    return `https:${candidate}`;
  }

  if (candidate.startsWith("/storage/") || candidate.startsWith("/store-media/")) {
    return `${API_ORIGIN}${candidate}`;
  }

  if (candidate.startsWith("storage/") || candidate.startsWith("store-media/")) {
    return `${API_ORIGIN}/${candidate}`;
  }

  if (candidate.startsWith("/")) {
    return candidate;
  }

  return `${API_ORIGIN}/storage/${candidate.replace(/^\/+/, "")}`;
}

export function pickMediaUrl(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const resolved = resolveMediaUrl(value);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export function isRemoteMediaUrl(value?: string | null): boolean {
  const resolved = resolveMediaUrl(value);
  return !!resolved && /^https?:\/\//i.test(resolved);
}
