import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { skipCSRFCheck } from "@auth/core";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  skipCSRFCheck,
  trustHost: true,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnArtist = nextUrl.pathname.startsWith("/artist");
      
      // Normalize role for comparison
      const userRole = auth?.user?.role?.toLowerCase().replace(/\s+/g, '_') || '';

      if (isOnAdmin) {
        if (isLoggedIn && ['admin', 'super_admin'].includes(userRole)) return true;
        return false;
      }

      if (isOnArtist) {
        if (isLoggedIn && ["artist", "label", "admin", "super_admin"].includes(userRole)) {
          return true;
        }
        return false;
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
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
    Credentials({
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
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://beta.test/api";

          console.log("[Auth] Attempting login for:", credentials.email);
          console.log("[Auth] API_URL:", API_URL);

          // Skip CSRF for API token auth - not needed for Sanctum token-based auth
          // CSRF is only required for SPA cookie-based auth

          // Login via API
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

          const data = await response.json();

          console.log("[Auth] Response status:", response.status);
          console.log("[Auth] Response data:", JSON.stringify(data).substring(0, 500));

          if (!response.ok) {
            console.error("[Auth] Login failed:", data.message || "Unknown error");
            return null;
          }

          if (data.user && data.token) {
            console.log("[Auth] Login successful for user:", data.user.email);
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name,
              role: data.user.role || "user",
              accessToken: data.token,
            };
          }

          console.error("[Auth] Missing user or token in response");
          return null;
        } catch (error) {
          console.error("[Auth] Exception during login:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "tesotunes-secret-key-change-in-production-2026",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
