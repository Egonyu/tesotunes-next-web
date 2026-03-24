import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_URL } from "./api-config";
import {
  AUTH_SERVICE_UNAVAILABLE_MESSAGE,
  buildAuthApiBaseUrls,
  fetchAuthApi,
} from "./auth-api";

// Refresh user role every 30 minutes (in milliseconds) - increased to avoid rate limits
const ROLE_REFRESH_INTERVAL = 30 * 60 * 1000;
const ACCESS_TOKEN_REFRESH_INTERVAL = 12 * 60 * 60 * 1000;

// Detect production/HTTPS environment
const isProduction = process.env.NODE_ENV === "production";

/**
 * Normalise NEXTAUTH_URL — Vercel sometimes strips the protocol.
 * If the raw env var is missing `https://`, we prepend it in production.
 * This ensures cookie flags (Secure, __Secure- prefix) are set correctly.
 */
function resolveNextAuthUrl(): string {
  const raw = process.env.NEXTAUTH_URL ?? "";
  if (raw.startsWith("https://")) return raw;
  if (raw.startsWith("http://")) {
    if (!isProduction) return raw;

    try {
      const parsed = new URL(raw);
      const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
      if (isLocalHost) return raw;
      return raw.replace("http://", "https://");
    } catch {
      return raw.replace("http://", "https://");
    }
  }
  // In production, always default to HTTPS
  if (isProduction && raw) return `https://${raw}`;
  return raw;
}

const resolvedNextAuthUrl = resolveNextAuthUrl();
const useSecureCookies = resolvedNextAuthUrl.startsWith("https://");

// CRITICAL: If NEXTAUTH_URL was missing the protocol, fix it at the process.env
// level so NextAuth's internal URL resolution also uses the corrected value.
// Without this, NextAuth will generate wrong callback URLs and fail to set cookies.
if (resolvedNextAuthUrl && resolvedNextAuthUrl !== process.env.NEXTAUTH_URL) {
  console.warn(
    `[Auth] Auto-correcting NEXTAUTH_URL from "${process.env.NEXTAUTH_URL}" to "${resolvedNextAuthUrl}"`
  );
  process.env.NEXTAUTH_URL = resolvedNextAuthUrl;
}

// Warn loudly at startup if NEXTAUTH_URL is misconfigured (skip in local dev)
if (isProduction && !useSecureCookies) {
  const isLocal = (() => {
    try { return ["localhost", "127.0.0.1"].includes(new URL(resolvedNextAuthUrl).hostname); } catch { return false; }
  })();
  if (!isLocal) {
    console.error(
      "[Auth] CRITICAL: NEXTAUTH_URL does not start with https:// — " +
      "session cookies will NOT be set. " +
      `Raw value: "${process.env.NEXTAUTH_URL}", resolved: "${resolvedNextAuthUrl}"`
    );
  }
}

/**
 * Safely parse JSON from a fetch response.
 * Returns null if the body is empty or not valid JSON.
 */
async function safeJsonParse(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    console.error("[Auth] Failed to parse JSON response:", text.substring(0, 200));
    return null;
  }
}

/**
 * Fetch fresh user data from the API to refresh role.
 * Returns null if the request fails (keeps existing role).
 */
async function fetchFreshUserData(accessToken: string): Promise<{ role: string; permissions: string[] } | { expired: true } | null> {
  try {
    const baseUrls = buildAuthApiBaseUrls(API_URL);
    let response: Response | null = null;

    for (const baseUrl of baseUrls) {
      try {
        response = await fetch(`${baseUrl}/user/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });
        break;
      } catch (error) {
        console.warn("[Auth] Error refreshing user data from", baseUrl, error);
      }
    }

    if (!response) {
      return null;
    }

    if (response.status === 401) {
      console.warn("[Auth] Access token expired (401)");
      return { expired: true };
    }

    if (!response.ok) {
      console.warn("[Auth] Failed to refresh user data, status:", response.status);
      return null;
    }

    const data = await safeJsonParse(response);
    if (!data) return null;

    // Support both { data: {...} } and direct {...} response shapes
    const user = (data.data as Record<string, unknown>) ?? data;
    const role = user.role as string;
    const permissionsRaw = user.permissions;
    const permissions = Array.isArray(permissionsRaw)
      ? permissionsRaw.filter((p): p is string => typeof p === "string")
      : [];

    if (role) {
      return { role, permissions };
    }
    return null;
  } catch (error) {
    console.warn("[Auth] Error refreshing user data:", error);
    return null;
  }
}

async function refreshApiAccessToken(
  accessToken: string
): Promise<{ accessToken: string } | { expired: true } | null> {
  try {
    const response = await fetchAuthApi("/auth/refresh", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401) {
      console.warn("[Auth] API token refresh rejected with 401");
      return { expired: true };
    }

    if (!response.ok) {
      console.warn("[Auth] Failed to refresh API token, status:", response.status);
      return null;
    }

    const data = await safeJsonParse(response);
    if (!data) {
      return null;
    }

    const refreshedToken =
      (data.token as string | undefined) ??
      ((data.data as Record<string, unknown> | undefined)?.token as string | undefined) ??
      (data.access_token as string | undefined);

    if (!refreshedToken) {
      console.warn("[Auth] Refresh endpoint returned no token");
      return null;
    }

    return { accessToken: refreshedToken };
  } catch (error) {
    console.warn("[Auth] Error refreshing API token:", error);
    return null;
  }
}

function extractAuthorizedUser(data: Record<string, unknown>) {
  const dataObj = data.data as Record<string, unknown> | undefined;
  const user = (data.user as Record<string, unknown>) ??
    (dataObj?.user as Record<string, unknown>) ??
    (dataObj?.id ? dataObj : undefined);
  const token = (data.token as string) ??
    (dataObj?.token as string) ??
    (data.access_token as string);

  if (!user || !token) {
    return null;
  }

  return {
    id: String(user.id),
    email: user.email as string,
    name: user.name as string,
    role: (user.role as string) || "user",
    permissions: Array.isArray(user.permissions)
      ? (user.permissions as unknown[]).filter((p): p is string => typeof p === "string")
      : [],
    accessToken: token,
  };
}

export async function authorizeCredentials(
  credentials: Record<string, string | boolean | undefined> | undefined
) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const rememberMe =
    credentials.remember_me === true || credentials.remember_me === "true";

  try {
    const response = await fetchAuthApi("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        remember_me: rememberMe,
      }),
    });

    const data = await safeJsonParse(response);

    if (!data) {
      console.error("[Auth] Empty or non-JSON response from API");
      throw new Error("The sign-in service returned an invalid response. Please try again.");
    }

    if (!response.ok) {
      const message = (data.message as string) || "Unknown error";
      console.error("[Auth] Login failed:", message);
      throw new Error(message);
    }

    const authorizedUser = extractAuthorizedUser(data);

    if (authorizedUser) {
      return authorizedUser;
    }

    console.error("[Auth] Missing user or token in response");
    throw new Error("The sign-in service returned an incomplete response. Please try again.");
  } catch (error) {
    console.error("[Auth] Exception during login:", error);

    if (error instanceof Error && /fetch failed|failed to fetch|econnrefused|network/i.test(error.message)) {
      throw new Error(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
  }
}

export const authConfig: NextAuthOptions = {
  // Enable debug logging only when explicitly requested (set NEXTAUTH_DEBUG=true)
  debug: process.env.NEXTAUTH_DEBUG === "true",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Explicit cookie configuration for production HTTPS
  // This ensures cookies work correctly on Vercel with custom domains
  useSecureCookies,
  cookies: useSecureCookies
    ? {
        sessionToken: {
          name: "__Secure-next-auth.session-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        callbackUrl: {
          name: "__Secure-next-auth.callback-url",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        csrfToken: {
          name: "__Host-next-auth.csrf-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
      }
    : undefined,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - set all user data
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
        token.accessToken = user.accessToken;
        token.accessTokenRefreshedAt = Date.now();
        token.roleRefreshedAt = Date.now();
      }

      const now = Date.now();
      const lastAccessTokenRefresh = (token.accessTokenRefreshedAt as number) || 0;
      const lastRefresh = (token.roleRefreshedAt as number) || 0;

      if (token.accessToken && (now - lastAccessTokenRefresh > ACCESS_TOKEN_REFRESH_INTERVAL)) {
        const refreshedToken = await refreshApiAccessToken(token.accessToken as string);

        if (refreshedToken && 'accessToken' in refreshedToken) {
          token.accessToken = refreshedToken.accessToken;
          token.accessTokenRefreshedAt = now;
        } else if (refreshedToken && 'expired' in refreshedToken) {
          console.warn("[Auth] Clearing expired access token after refresh failure");
          token.accessToken = undefined;
        }
      }

      if (token.accessToken && (now - lastRefresh > ROLE_REFRESH_INTERVAL)) {
        let freshData = await fetchFreshUserData(token.accessToken as string);

        if (freshData && 'expired' in freshData) {
          const refreshedToken = await refreshApiAccessToken(token.accessToken as string);

          if (refreshedToken && 'accessToken' in refreshedToken) {
            token.accessToken = refreshedToken.accessToken;
            token.accessTokenRefreshedAt = now;
            freshData = await fetchFreshUserData(refreshedToken.accessToken);
          } else if (refreshedToken && 'expired' in refreshedToken) {
            console.warn("[Auth] Clearing expired access token");
            token.accessToken = undefined;
          }
        } else if (freshData && 'role' in freshData) {
          token.role = freshData.role;
          token.permissions = freshData.permissions;
        }

        if (freshData && 'role' in freshData) {
          token.role = freshData.role;
          token.permissions = freshData.permissions;
        }

        token.roleRefreshedAt = now;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = (token.permissions as string[] | undefined) ?? [];
        session.user.apiAuthorized = Boolean(token.accessToken);
        session.user.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember_me: { label: "Remember me", type: "checkbox" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};
