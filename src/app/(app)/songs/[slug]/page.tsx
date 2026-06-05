import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/lib/api'
import { JsonLd } from '@/components/seo/JsonLd'
import SongDetailPage, { type SongDetail } from './SongPageClient'
import { absoluteUrl } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>
}

const getSong = cache(async (slug: string): Promise<SongDetail | null> => {
  try {
    const res = await serverFetch<{ data: SongDetail }>(`/songs/${slug}`)
    return res.data
  } catch {
    return null
  }
})

export async function generateStaticParams() {
  try {
    const res = await serverFetch<{ data: { slug: string }[] }>('/songs?limit=500&status=published')
    return (res.data || []).map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const song = await getSong(slug)

  if (!song) return { title: 'Song Not Found' }

  const title = `${song.title} by ${song.artist.name}`
  const description = song.description || `Listen to "${song.title}" by ${song.artist.name} on TesoTunes.`
  const image = song.artwork_url || song.album?.artwork_url || undefined

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: absoluteUrl(`/songs/${slug}`) },
    openGraph: {
      type: 'music.song',
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description, images: image ? [image] : undefined },
  }
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params
  const song = await getSong(slug)

  if (!song) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    url: absoluteUrl(`/songs/${slug}`),
    image: song.artwork_url || song.album?.artwork_url || undefined,
    byArtist: {
      '@type': 'MusicGroup',
      name: song.artist.name,
      url: absoluteUrl(`/artists/${song.artist.slug}`),
    },
    inAlbum: song.album ? {
      '@type': 'MusicAlbum',
      name: song.album.title,
      url: absoluteUrl(`/albums/${song.album.slug}`),
    } : undefined,
    genre: song.genre?.name,
    datePublished: song.release_date || undefined,
    description: song.description || undefined,
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <SongDetailPage initialSong={song} slug={slug} />
    </>
  )
}
