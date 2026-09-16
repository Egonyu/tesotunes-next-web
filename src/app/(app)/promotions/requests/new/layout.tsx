import type { Metadata } from 'next'

// Private to the signed-in account.
export const metadata: Metadata = {
  title: 'Post a promotion brief',
  robots: { index: false, follow: false },
}

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children
}
