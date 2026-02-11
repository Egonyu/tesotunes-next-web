import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tesotunes.com";

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

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
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
          console.log("[Auth] Attempting login for:", credentials.email);
          console.log("[Auth] API_URL:", API_URL);

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

          console.log("[Auth] Response status:", response.status);

          const data = await safeJsonParse(response);

          if (!data) {
            console.error("[Auth] Empty or non-JSON response from API");
            return null;
          }

          console.log("[Auth] Response data:", JSON.stringify(data).substring(0, 500));

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
          const user = (data.user as Record<string, unknown>) ??
            ((data.data as Record<string, unknown>)?.user as Record<string, unknown>);
          const token = (data.token as string) ??
            ((data.data as Record<string, unknown>)?.token as string) ??
            (data.access_token as string);

          if (user && token) {
            console.log("[Auth] Login successful for user:", user.email);
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
  secret: process.env.NEXTAUTH_SECRET || "tesotunes-secret-key-change-in-production-2026",
};
