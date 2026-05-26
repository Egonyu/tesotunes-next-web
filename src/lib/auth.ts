import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { API_URL } from "./api-config";
import {
  AUTH_SERVICE_UNAVAILABLE_MESSAGE,
  buildAuthApiBaseUrls,
  fetchAuthApi,
} from "./auth-api";
import {
  getEnabledSocialAuthProvidersForPlatformSettings,
  isSocialAuthProviderEnabled,
  type SocialProviderId,
} from "./social-auth";
import type { PlatformSettings } from "./platform-settings";

// Refresh role and access posture every 5 minutes so artist/admin changes
// propagate quickly without requiring a fresh sign-in.
const ROLE_REFRESH_INTERVAL = 5 * 60 * 1000;
const ACCESS_TOKEN_REFRESH_INTERVAL = 12 * 60 * 60 * 1000;
const RUNTIME_SOCIAL_SETTINGS_TTL_MS = 60 * 1000;

type PlatformSocialSettings = Pick<PlatformSettings, "users" | "security">;

let runtimeSocialSettingsCache: {
  value: PlatformSocialSettings | null;
  expiresAt: number;
} | null = null;

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

async function getRuntimeSocialSettings(): Promise<PlatformSocialSettings | null> {
  const now = Date.now();
  if (runtimeSocialSettingsCache && runtimeSocialSettingsCache.expiresAt > now) {
    return runtimeSocialSettingsCache.value;
  }

  try {
    const response = await fetchAuthApi("/settings/public", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      runtimeSocialSettingsCache = {
        value: null,
        expiresAt: now + RUNTIME_SOCIAL_SETTINGS_TTL_MS,
      };
      return null;
    }

    const data = await safeJsonParse(response);
    const rows = (data?.data as Array<{ key: string; value: unknown }> | undefined) ?? [];
    const users: Record<string, unknown> = {};
    const security: Record<string, unknown> = {};
    for (const row of rows) {
      if (row.key === "users_social_login_enabled") {
        users.social_login_enabled = row.value;
      } else if (
        row.key === "auth_google_login_enabled" ||
        row.key === "auth_facebook_login_enabled" ||
        row.key === "auth_apple_login_enabled"
      ) {
        security[row.key.slice("auth_".length)] = row.value;
      }
    }
    const settings = {
      users: users as PlatformSocialSettings["users"],
      security: security as PlatformSocialSettings["security"],
    };

    runtimeSocialSettingsCache = {
      value: settings,
      expiresAt: now + RUNTIME_SOCIAL_SETTINGS_TTL_MS,
    };

    return settings;
  } catch {
    runtimeSocialSettingsCache = {
      value: null,
      expiresAt: now + RUNTIME_SOCIAL_SETTINGS_TTL_MS,
    };
    return null;
  }
}

/**
 * Fetch fresh user data from the API to refresh role.
 * Returns null if the request fails (keeps existing role).
 */
async function fetchFreshUserData(accessToken: string): Promise<{ role: string; permissions: string[]; isArtist: boolean; isEventOrganizer: boolean } | { expired: true } | null> {
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
    const isArtist = Boolean(user.is_artist) || Boolean(user.artist);
    const eventOrganizer = user.event_organizer as Record<string, unknown> | undefined;
    const isEventOrganizer = Boolean(eventOrganizer?.enabled);
    const permissionsRaw = user.permissions;
    const permissions = Array.isArray(permissionsRaw)
      ? permissionsRaw.filter((p): p is string => typeof p === "string")
      : [];

    if (role) {
      return { role, permissions, isArtist, isEventOrganizer };
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

async function revokeApiAccessToken(accessToken: string): Promise<void> {
  try {
    await fetchAuthApi("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
  } catch (error) {
    console.warn("[Auth] Error revoking API token during sign-out:", error);
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
    isArtist: Boolean(user.is_artist) || Boolean(user.artist),
    isEventOrganizer: Boolean((user.event_organizer as Record<string, unknown> | undefined)?.enabled),
    permissions: Array.isArray(user.permissions)
      ? (user.permissions as unknown[]).filter((p): p is string => typeof p === "string")
      : [],
    accessToken: token,
  };
}

async function authorizeSocialProvider(provider: string, tokens: { accessToken?: string; idToken?: string }) {
  const response = await fetchAuthApi(`/auth/social/${provider}/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_token: tokens.accessToken,
      id_token: tokens.idToken,
      platform: "web",
      device_name: "nextauth_social",
    }),
  });

  const data = await safeJsonParse(response);
  if (!response.ok || !data) {
    const message = (data?.message as string | undefined) || "Social login failed";
    throw new Error(message);
  }

  const userPayload = (data.data as Record<string, unknown> | undefined) ?? {};
  const user = (userPayload.data as Record<string, unknown> | undefined) ?? userPayload;
  const accessToken = data.token as string | undefined;

  if (!user?.id || !accessToken) {
    throw new Error("Incomplete social login response");
  }

  return {
    id: String(user.id),
    email: (user.email as string | undefined) ?? "",
    name: (user.name as string | undefined) ?? "",
    role: (user.role as string) || "user",
    isArtist: Boolean(user.is_artist) || Boolean(user.artist),
    isEventOrganizer: Boolean((user.event_organizer as Record<string, unknown> | undefined)?.enabled),
    permissions: Array.isArray(user.permissions)
      ? (user.permissions as unknown[]).filter((p): p is string => typeof p === "string")
      : [],
    accessToken,
  };
}

export async function authorizeCredentials(
  credentials: Record<string, string | boolean | undefined> | undefined
) {
  // 2FA challenge completion path — triggered when the login page re-submits
  // with the pending two_fa_token + user-entered TOTP/recovery code.
  if (credentials?.two_fa_token && credentials?.two_fa_code) {
    try {
      const response = await fetchAuthApi("/auth/2fa/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          two_fa_token: credentials.two_fa_token,
          code: credentials.two_fa_code,
        }),
      });

      const data = await safeJsonParse(response);

      if (!data) {
        throw new Error("The sign-in service returned an invalid response. Please try again.");
      }

      if (!response.ok) {
        throw new Error((data.message as string) || "Invalid authentication code.");
      }

      const authorizedUser = extractAuthorizedUser(data);
      if (authorizedUser) return authorizedUser;

      throw new Error("The sign-in service returned an incomplete response. Please try again.");
    } catch (error) {
      if (error instanceof Error && /fetch failed|failed to fetch|econnrefused|network/i.test(error.message)) {
        throw new Error(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
      }
      if (error instanceof Error) throw error;
      throw new Error(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
    }
  }

  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const rememberMe =
    credentials.remember_me === true || credentials.remember_me === "true";
  const isLocalDevelopment = process.env.NODE_ENV !== "production";
  const shouldTryLocalAdminFallback = (message: string) =>
    isLocalDevelopment && /verify your email/i.test(message);

  try {
    const requestBody = {
      email: credentials.email,
      password: credentials.password,
      remember_me: rememberMe,
      recaptcha_token: credentials.recaptcha_token ?? undefined,
    };

    let response = await fetchAuthApi("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    let data = await safeJsonParse(response);

    if (!data) {
      console.error("[Auth] Empty or non-JSON response from API");
      throw new Error("The sign-in service returned an invalid response. Please try again.");
    }

    // 2FA required — signal the login page to show the TOTP challenge input.
    // Encode the pending token in the error message so the page can extract it.
    if (response.ok && data.requires_2fa && data.two_fa_token) {
      throw new Error(`TWO_FA_REQUIRED:${data.two_fa_token as string}`);
    }

    if (!response.ok) {
      const message = (data.message as string) || "Unknown error";
      const retryAfter = typeof data.retry_after === "number"
        ? data.retry_after
        : typeof data.retry_after === "string"
          ? Number(data.retry_after)
          : null;
      const enrichedMessage =
        response.status === 429 && retryAfter && retryAfter > 0
          ? `Too many login attempts. Try again in ${retryAfter} seconds.`
          : message;

      if (shouldTryLocalAdminFallback(enrichedMessage)) {
        const fallbackResponse = await fetchAuthApi("/auth/local-admin-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const fallbackData = await safeJsonParse(fallbackResponse);

        if (fallbackResponse.ok && fallbackData) {
          const authorizedFallbackUser = extractAuthorizedUser(fallbackData);

          if (authorizedFallbackUser) {
            return authorizedFallbackUser;
          }
        }
      }

      console.error("[Auth] Login failed:", enrichedMessage);
      throw new Error(enrichedMessage);
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
    async signIn({ account }) {
      if (!account?.provider || account.provider === "credentials") {
        return true;
      }

      if (!["google", "facebook", "twitter", "apple"].includes(account.provider)) {
        return true;
      }

      const runtimeSocialSettings = await getRuntimeSocialSettings();
      if (!runtimeSocialSettings) {
        return false;
      }

      const enabledProviders = getEnabledSocialAuthProvidersForPlatformSettings(runtimeSocialSettings);

      return enabledProviders.has(account.provider as SocialProviderId);
    },
    async jwt({ token, user, account }) {
      if (
        account?.provider &&
        account.provider !== "credentials" &&
        (typeof account.access_token === "string" || typeof account.id_token === "string")
      ) {
        const socialAuthUser = await authorizeSocialProvider(account.provider, {
          accessToken: typeof account.access_token === "string" ? account.access_token : undefined,
          idToken: typeof account.id_token === "string" ? account.id_token : undefined,
        });
        token.id = socialAuthUser.id;
        token.email = socialAuthUser.email;
        token.name = socialAuthUser.name;
        token.role = socialAuthUser.role;
        token.isArtist = socialAuthUser.isArtist;
        token.isEventOrganizer = socialAuthUser.isEventOrganizer;
        token.permissions = socialAuthUser.permissions;
        token.accessToken = socialAuthUser.accessToken;
        token.accessTokenRefreshedAt = Date.now();
        token.roleRefreshedAt = Date.now();

        return token;
      }

      // Initial sign in - set all user data
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.isArtist = user.isArtist;
        token.isEventOrganizer = user.isEventOrganizer;
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
        }

        if (freshData && 'role' in freshData) {
          token.role = freshData.role;
          token.isArtist = freshData.isArtist;
          token.isEventOrganizer = freshData.isEventOrganizer;
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
        session.user.isArtist = Boolean(token.isArtist);
        session.user.isEventOrganizer = Boolean(token.isEventOrganizer);
        session.user.permissions = (token.permissions as string[] | undefined) ?? [];
        session.user.apiAuthorized = Boolean(token.accessToken);
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const accessToken = token?.accessToken;

      if (typeof accessToken === "string" && accessToken.length > 0) {
        await revokeApiAccessToken(accessToken);
      }
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember_me: { label: "Remember me", type: "checkbox" },
        recaptcha_token: { label: "reCAPTCHA", type: "text" },
        two_fa_token: { label: "2FA Token", type: "text" },
        two_fa_code: { label: "2FA Code", type: "text" },
      },
      authorize: authorizeCredentials,
    }),
    ...(isSocialAuthProviderEnabled("google") && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "openid email profile",
              },
            },
          }),
        ]
      : []),
    ...(isSocialAuthProviderEnabled("facebook") && process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "email public_profile",
              },
            },
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};
