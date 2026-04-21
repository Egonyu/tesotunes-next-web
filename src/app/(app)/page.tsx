import type { Metadata } from 'next'
import { ClassicHomePage } from "@/components/home/classic-home-page";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: 'TesoTunes — East African Music Platform',
  description: 'Discover, stream, and support East African music. Your platform for authentic African sounds — artists, albums, events, and more.',
  alternates: { canonical: 'https://tesotunes.com' },
  openGraph: {
    type: 'website',
    url: 'https://tesotunes.com',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TesoTunes',
  url: 'https://tesotunes.com',
  description: 'East African music streaming platform — discover artists, albums, and events.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tesotunes.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TesoTunes',
  url: 'https://tesotunes.com',
  logo: 'https://tesotunes.com/logo.png',
  sameAs: [
    'https://twitter.com/tesotunes',
    'https://instagram.com/tesotunes',
    'https://facebook.com/tesotunes',
  ],
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <ClassicHomePage />
    </>
  )
}
