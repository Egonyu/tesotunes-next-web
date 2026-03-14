import { withAuth } from "next-auth/middleware";

// Ensure NextAuth sees a fully-qualified URL before auth middleware runs.
if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith("http")) {
  process.env.NEXTAUTH_URL = `https://${process.env.NEXTAUTH_URL}`;
}

export default withAuth(
  function proxy() {
    // withAuth handles the actual access checks and redirects.
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
