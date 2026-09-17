/**
 * Cookies the Laravel API actually reads. Everything else on the site's
 * cookie jar stays in the browser.
 *
 * The /api/backend proxy used to forward the browser's whole Cookie header.
 * The API authenticates with the bearer token the proxy adds, so none of it
 * was needed — and the NextAuth session cookie (split into ~4KB chunks, larger
 * for admins whose token carries their permissions) pushed the request header
 * past nginx's limit. nginx then dropped the request ("-" 000 in the access
 * log), Cloudflare answered 520, and admin lists rendered empty. It also sent
 * the session JWT to a service that has no use for it.
 */
export const API_COOKIE_ALLOWLIST = ["poll_session_token"] as const;

/** The Cookie header to forward upstream, or null when nothing should go. */
export function filterCookieHeader(
  cookieHeader: string | null | undefined,
  allowlist: readonly string[] = API_COOKIE_ALLOWLIST
): string | null {
  if (!cookieHeader) return null;

  const kept = cookieHeader
    .split(";")
    .map((pair) => pair.trim())
    .filter((pair) => {
      const name = pair.slice(0, pair.indexOf("=") === -1 ? pair.length : pair.indexOf("=")).trim();
      return allowlist.includes(name);
    });

  return kept.length > 0 ? kept.join("; ") : null;
}
