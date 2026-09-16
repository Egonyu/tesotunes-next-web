import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Promotion services',
  description:
    'Compare music promotion services by platform, audience, delivery time and rating, and book the one that fits your release.',
  alternates: { canonical: absoluteUrl('/promotions/browse') },
}

export default function BrowsePromotionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
