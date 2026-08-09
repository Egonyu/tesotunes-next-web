import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes: require admin role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Artist routes: require artist or admin role
    if (pathname.startsWith("/artist")) {
      if (token?.role !== "artist" && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
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
