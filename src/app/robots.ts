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
          '/artist/',
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
          '/ojokotau',
          '/edula',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
