/**
 * Set by the /api/backend proxy when Laravel has refused the session's API
 * token outright (not just a 401 a signed-in user can still clear).
 */
export const SESSION_EXPIRED_HEADER = "x-tesotunes-session-expired";

const PAGES_THAT_ALREADY_EXPLAIN = ["/access-required", "/login", "/logout"];

let redirecting = false;

type HeaderBag = Record<string, unknown> | { get?: (name: string) => unknown } | undefined;

function readHeader(headers: HeaderBag, name: string): unknown {
  if (!headers) return undefined;
  if (typeof (headers as { get?: unknown }).get === "function") {
    return (headers as { get: (name: string) => unknown }).get(name);
  }
  return (headers as Record<string, unknown>)[name];
}

export function isSessionExpiredResponse(
  response: { status?: number; headers?: HeaderBag } | undefined
): boolean {
  return response?.status === 401 && readHeader(response.headers, SESSION_EXPIRED_HEADER) === "1";
}

/**
 * Sends someone whose API token died while they were away to the "session
 * expired" notice, which clears the stale cookie and offers sign-in.
 *
 * Before this, the 401s were swallowed per-widget: React Query kept showing
 * whatever it last fetched, so a returning user saw yesterday's balances
 * beside zeros until they signed in again by hand. A full navigation also
 * throws away that cached data, so nothing stale survives the redirect.
 */
export function handleSessionExpired(
  location: Pick<Location, "pathname" | "search" | "assign"> | undefined =
    typeof window === "undefined" ? undefined : window.location
): void {
  if (!location || redirecting) return;

  const { pathname, search } = location;
  if (PAGES_THAT_ALREADY_EXPLAIN.some((page) => pathname.startsWith(page))) return;

  redirecting = true;
  const callbackUrl = encodeURIComponent(`${pathname}${search}`);
  location.assign(`/access-required?reason=expired&callbackUrl=${callbackUrl}`);
}

/** Test hook: the redirect guard is module state. */
export function resetSessionExpiryForTests(): void {
  redirecting = false;
}
