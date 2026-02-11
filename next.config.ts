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
      },
    ],
  },

  // API rewrites for Laravel backend (excluding NextAuth routes)
  async rewrites() {
    return {
      beforeFiles: [
        // Exclude NextAuth routes from rewrite
      ],
      afterFiles: [
        // Proxy other API routes to Laravel backend
        {
          source: "/api/:path((?!auth).*)",
          destination: `${process.env.NEXT_PUBLIC_API_URL || "https://api.tesotunes.com"}/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
