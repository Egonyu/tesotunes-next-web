import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_URL } from "./api-config";

// Refresh user role every 30 minutes (in milliseconds) - increased to avoid rate limits
const ROLE_REFRESH_INTERVAL = 30 * 60 * 1000;

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
async function fetchFreshUserData(accessToken: string): Promise<{ role: string } | { expired: true } | null> {
  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

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

    if (role) {
      return { role };
    }
    return null;
  } catch (error) {
    console.warn("[Auth] Error refreshing user data:", error);
    return null;
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
        token.accessToken = user.accessToken;
        token.roleRefreshedAt = Date.now();
      }

      // Periodically refresh role from API (every 5 minutes)
      // This ensures role changes made by admin are reflected without re-login
      const now = Date.now();
      const lastRefresh = (token.roleRefreshedAt as number) || 0;

      if (token.accessToken && (now - lastRefresh > ROLE_REFRESH_INTERVAL)) {
        const freshData = await fetchFreshUserData(token.accessToken as string);
        if (freshData && 'expired' in freshData) {
          // Token expired — clear it so TokenSync removes from in-memory store
          // User will be redirected to login on next protected API call
          console.warn("[Auth] Clearing expired access token");
          token.accessToken = undefined;
        } else if (freshData && 'role' in freshData) {
          token.role = freshData.role;
        }
        token.roleRefreshedAt = now;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await safeJsonParse(response);

          if (!data) {
            console.error("[Auth] Empty or non-JSON response from API");
            return null;
          }

          if (!response.ok) {
            const message = (data.message as string) || "Unknown error";
            console.error("[Auth] Login failed:", message);
            // Surface 2FA requirement to the frontend
            if (response.status === 423 || message.toLowerCase().includes("two factor")) {
              throw new Error("2FA_REQUIRED");
            }
            throw new Error(message);
          }

          // Support multiple Laravel response shapes:
          // Shape 1: { user: {...}, token: "..." }
          // Shape 2: { data: { user: {...}, token: "..." } }
          // Shape 3: { success: true, data: { user: {...} }, token: "..." }
          // Shape 4: { data: {...user fields...}, token: "..." } (UserResource)
          const dataObj = data.data as Record<string, unknown> | undefined;
          const user = (data.user as Record<string, unknown>) ??
            (dataObj?.user as Record<string, unknown>) ??
            (dataObj?.id ? dataObj : undefined);
          const token = (data.token as string) ??
            (dataObj?.token as string) ??
            (data.access_token as string);

          if (user && token) {
            return {
              id: String(user.id),
              email: user.email as string,
              name: user.name as string,
              role: (user.role as string) || "user",
              accessToken: token,
            };
          }

          console.error("[Auth] Missing user or token in response");
          return null;
        } catch (error) {
          console.error("[Auth] Exception during login:", error);
          // Re-throw known error messages so NextAuth surfaces them
          if (error instanceof Error && error.message === "2FA_REQUIRED") {
            throw error;
          }
          if (error instanceof Error && error.message !== "Unknown error") {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};
