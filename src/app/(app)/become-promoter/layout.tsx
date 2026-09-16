import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Become a music promoter',
  description:
    'Earn by promoting music to your audience. Set up a promoter profile, list your services and get paid into your TesoTunes wallet. No artist account needed.',
  alternates: { canonical: absoluteUrl('/become-promoter') },
}

export default function BecomePromoterLayout({ children }: { children: React.ReactNode }) {
  return children
}
