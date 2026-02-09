export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    // Only protect these specific routes
    "/library/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/wallet/:path*",
    "/sacco/:path*",
    "/artist-dashboard/:path*",
    "/admin/:path*",
  ],
};
