import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/lib/api'
import type { Artist } from '@/types'
import { JsonLd } from '@/components/seo/JsonLd'
import ArtistPageClient from './ArtistPageClient'
import { SITE_URL, absoluteUrl } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>
}

const getArtistForMeta = cache(async (slug: string): Promise<Artist | null> => {
  try {
    const res = await serverFetch<{ data: Artist }>(`/artists/${slug}`)
    return res.data
  } catch {
    return null
  }
})

export async function generateStaticParams() {
  try {
    const res = await serverFetch<{ data: { slug: string }[] }>('/artists?limit=200&status=approved')
    return (res.data || []).map((a) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artist = await getArtistForMeta(slug)

  if (!artist) return { title: 'Artist Not Found' }

  const title = artist.name
  const description = artist.bio
    || `Listen to ${artist.name} on TesoTunes — ${artist.total_songs || 0} songs, ${artist.total_albums || 0} albums.`
  const image = artist.avatar_url || undefined

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/artists/${slug}`) },
    openGraph: {
      type: 'profile',
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description, images: image ? [image] : undefined },
  }
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params
  const artist = await getArtistForMeta(slug)

  if (!artist) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url: absoluteUrl(`/artists/${slug}`),
    image: artist.avatar_url || undefined,
    description: artist.bio || undefined,
    genre: artist.genre?.name,
    sameAs: artist.social_links
      ? Object.values(artist.social_links).filter(Boolean)
      : undefined,
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Artists', item: absoluteUrl('/artists') },
      { '@type': 'ListItem', position: 3, name: artist.name, item: absoluteUrl(`/artists/${slug}`) },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />
      <ArtistPageClient />
    </>
  )
}
