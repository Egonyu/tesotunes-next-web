import type { MetadataRoute } from 'next'

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://tesotunes.com').replace(/\/$/, '')

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
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
