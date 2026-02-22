import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone mode for optimized Docker deployment
  output: "standalone",

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "tesotunes-api.test",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "beta.test",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "engine.tesotunes.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "*.tesotunes.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
    ],
  },

  // API rewrites for Laravel backend (excluding NextAuth routes)
  async rewrites() {
    const rawApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.tesotunes.com/api";
    // Ensure the destination always ends with /api so Laravel receives the
    // correct prefix regardless of whether the env var includes it or not.
    const apiBase = rawApiUrl.replace(/\/api\/?$/, "");  // strip trailing /api
    return {
      beforeFiles: [
        // Pin /api/auth/* to the filesystem so the NextAuth route always wins,
        // even if Turbopack hasn't compiled the route yet
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*",
        },
      ],
      afterFiles: [
        // Proxy all other /api/* routes to the Laravel backend
        {
          source: "/api/:path((?!auth).*)",
          destination: `${apiBase}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
