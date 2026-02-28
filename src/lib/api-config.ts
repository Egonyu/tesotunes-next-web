/**
 * Centralized API URL configuration.
 *
 * Convention: NEXT_PUBLIC_API_URL should always include the /api suffix.
 *   Local dev:  http://tesotunes-api.test/api
 *   Production: https://api.tesotunes.com/api
 *
 * If the env var is missing or does NOT end with /api, we normalise it here
 * so every consumer gets a consistent base URL ending in /api.
 *
 * NOTE: On production, Nginx rewrites REQUEST_URI to prepend /api for paths
 * that don't already start with /api/. This means server-side calls work
 * with both formats, but we standardise on the /api suffix for clarity.
 */

const raw =
  process.env.NEXT_PUBLIC_API_URL || "https://api.tesotunes.com/api";

/**
 * Full API base URL ending in /api (no trailing slash).
 * Use this for ALL server-side (RSC, NextAuth, route handlers) requests.
 *
 * Example: `${API_URL}/auth/login`  →  https://api.tesotunes.com/api/auth/login
 */
export const API_URL: string = raw.replace(/\/+$/, "").endsWith("/api")
  ? raw.replace(/\/+$/, "")
  : `${raw.replace(/\/+$/, "")}/api`;

/**
 * Origin without the /api path — used by the Next.js rewrite proxy
 * to construct the destination URL.
 *
 * Example: https://api.tesotunes.com
 */
export const API_ORIGIN: string = API_URL.replace(/\/api$/, "");

/**
 * Whether we are running on the server (Node.js) vs browser.
 */
export const isServer: boolean = typeof window === "undefined";

/**
 * Whether the current environment is local development.
 */
export const isLocalDev: boolean =
  API_URL.includes("localhost") || API_URL.includes(".test");
