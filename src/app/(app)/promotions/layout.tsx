import type { Metadata } from 'next'

// No canonical here: child routes would inherit it. Detail pages set their own.
export const metadata: Metadata = {
  title: 'Promote your music',
  description:
    'Book TikTok, Instagram, radio and DJ promoters for your songs and events on TesoTunes. Your payment is held until you accept the delivery.',
}

export default function PromotionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
