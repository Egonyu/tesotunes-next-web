import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

// The /songs index is a client component ("use client") and therefore cannot
// export metadata itself. This layout supplies the canonical + SEO metadata for
// the index route. Song detail pages (/songs/[slug]) export their own
// generateMetadata, whose canonical overrides this one.
export const metadata: Metadata = {
  title: 'Songs',
  description:
    'Stream the latest East African songs on TesoTunes — trending tracks, new releases, and top-played music.',
  alternates: { canonical: absoluteUrl('/songs') },
  openGraph: {
    title: 'Songs | TesoTunes',
    description:
      'Stream the latest East African songs on TesoTunes — trending tracks, new releases, and top-played music.',
    url: absoluteUrl('/songs'),
  },
}

export default function SongsLayout({ children }: { children: React.ReactNode }) {
  return children
}
