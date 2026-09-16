import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Promotion briefs',
  description:
    'Open briefs from artists and event organisers looking for promoters. Apply with your price and timeline.',
}

export default function PromotionRequestsLayout({ children }: { children: React.ReactNode }) {
  return children
}
