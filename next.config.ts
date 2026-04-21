import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone mode for Docker deployment — Vercel ignores this, but keep it
  // so local Docker builds still work.
  output: process.env.VERCEL ? undefined : "standalone",

  // Image optimization configuration
  images: {
    // In local dev, tesotunes-api.test resolves to 127.0.0.1 (private IP).
    // Next.js Image optimization blocks private IPs, so skip it in dev.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.tesotunes.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api.tesotunes.com",
        pathname: "/store-media/**",
      },
      {
        protocol: "https",
        hostname: "beta.tesotunes.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "beta.tesotunes.com",
        pathname: "/store-media/**",
      },
      {
        protocol: "http",
        hostname: "tesotunes-api.test",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "tesotunes-api.test",
        pathname: "/store-media/**",
      },
      {
        protocol: "http",
        hostname: "beta.test",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "beta.test",
        pathname: "/store-media/**",
      },
      {
        protocol: "https",
        hostname: "engine.tesotunes.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "engine.tesotunes.com",
        pathname: "/store-media/**",
      },
      {
        protocol: "https",
        hostname: "**.tesotunes.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "**.tesotunes.com",
        pathname: "/store-media/**",
      },
      {
        protocol: "https",
        hostname: "emuria.syd1.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
    ],
  },

  // Block search engine indexing for protected/admin routes
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/artist/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/artist-dashboard/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/(profile|settings|credits|history|library|messages|notifications|referrals|sacco|tickets|transactions|wallet|loyalty|ojokotau)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },

  // API rewrites for Laravel backend (excluding NextAuth routes)
  async rewrites() {
    const isHostedDeployment =
      process.env.VERCEL === '1' ||
      process.env.VERCEL === 'true' ||
      process.env.APP_ENV === 'production' ||
      process.env.NODE_ENV === 'production';

    const rawApiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_API_URL ||
      process.env.API_URL ||
      (isHostedDeployment ? 'https://api.tesotunes.com/api' : 'http://tesotunes-api.test/api');
    // Normalise: ensure the raw value ends with /api, then strip it to get the
    // origin.  This handles both "https://api.tesotunes.com" and
    // "https://api.tesotunes.com/api" gracefully.
    const normalised = rawApiUrl.replace(/\/+$/, "").endsWith("/api")
      ? rawApiUrl.replace(/\/+$/, "")
      : `${rawApiUrl.replace(/\/+$/, "")}/api`;
    const apiBase = normalised.replace(/\/api$/, "");  // origin only
    return {
      beforeFiles: [
        // Proxy Laravel media paths so relative src values like /storage/* and
        // /store-media/* work on both local and hosted frontend domains.
        {
          source: "/storage/:path*",
          destination: `${apiBase}/storage/:path*`,
        },
        {
          source: "/store-media/:path*",
          destination: `${apiBase}/store-media/:path*`,
        },
        // Pin /api/auth/* to the filesystem so the NextAuth route always wins,
        // even if Turbopack hasn't compiled the route yet
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*",
        },
        // Pin /api/backend/* to the filesystem so the local proxy route wins
        // over the generic Laravel rewrite.
        {
          source: "/api/backend/:path*",
          destination: "/api/backend/:path*",
        },
      ],
      afterFiles: [
        // Proxy all other /api/* routes to the Laravel backend
        {
          source: "/api/:path((?!(?:auth|backend)).*)",
          destination: `${apiBase}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
