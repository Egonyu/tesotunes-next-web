import { withAuth } from "next-auth/middleware";

// CRITICAL: Fix NEXTAUTH_URL protocol before withAuth reads it.
// Vercel env has "www.tesotunes.com" (no protocol) — withAuth uses this
// to decide the cookie name prefix (__Secure- vs plain). Without https://
// it looks for the wrong cookie and always redirects to /access-required.
if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith("http")) {
  process.env.NEXTAUTH_URL = `https://${process.env.NEXTAUTH_URL}`;
}

export default withAuth(
  function middleware() {
    // Intentionally empty: withAuth handles auth checks and redirect rules.
  },
  {
    pages: {
      signIn: "/access-required",
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: [
    // Only protect these specific routes
    "/library/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/wallet/:path*",
    "/sacco/:path*",
    "/artist/:path*",
    "/artist-dashboard/:path*",
    "/admin/:path*",
  ],
};
