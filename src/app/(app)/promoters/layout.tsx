import type { Metadata } from 'next'

// No canonical here: /promoters/[username] sets its own.
export const metadata: Metadata = {
  title: 'Music promoters',
  description:
    'Find TikTok creators, Instagram pages, radio presenters and DJs who promote music in Uganda and East Africa.',
}

export default function PromotersLayout({ children }: { children: React.ReactNode }) {
  return children
}
