import { withAuth } from "next-auth/middleware";

export const proxy = withAuth(
  function middleware() {
    // Intentionally empty: withAuth handles auth checks and redirect rules.
  },
  {
    pages: {
      signIn: "/access-required",
    },
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
