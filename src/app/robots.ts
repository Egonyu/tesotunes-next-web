import type { MetadataRoute } from 'next'
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/artist-dashboard/',
          '/access-required',
          '/profile',
          '/settings',
          '/credits',
          '/history',
          '/library',
          '/messages',
          '/notifications',
          '/queue',
          '/referrals',
          '/sacco',
          '/tickets',
          '/transactions',
          '/wallet',
          '/loyalty',
          '/dashboard',
          '/become-artist/status',
          // Private promoter and buyer pages; the public side is
          // /promoters/* and /promotions/*.
          // Not a bare '/promoter' prefix: that would also block /promoters/*.
          '/promoter$',
          '/promoter/',
          '/promotions/purchases',
          '/promotions/requests/mine',
          '/promotions/requests/new',
          '/hub',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
