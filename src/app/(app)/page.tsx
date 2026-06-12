import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { ClassicHomePage } from "@/components/home/classic-home-page";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: 'TesoTunes — East African Music Platform',
  description: 'Discover, stream, and support East African music. Your platform for authentic African sounds — artists, albums, events, and more.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TesoTunes',
  url: SITE_URL,
  description: 'East African music streaming platform — discover artists, albums, and events.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: absoluteUrl('/search?q={search_term_string}'),
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TesoTunes',
  url: SITE_URL,
  logo: absoluteUrl('/logo.png'),
  sameAs: [
    'https://twitter.com/tesotunes',
    'https://instagram.com/tesotunes',
    'https://facebook.com/tesotunes',
  ],
}

export default async function HomePage() {
  const session = await getServerSession(authConfig)
  const user = session?.user
    ? { name: session.user.name, role: session.user.role, isArtist: session.user.isArtist }
    : null

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <ClassicHomePage user={user} />
    </>
  )
}
