import type { Metadata } from 'next'
import { cache } from 'react'
import { serverFetch } from '@/lib/api'
import { JsonLd } from '@/components/seo/JsonLd'
import SongDetailPage from './SongPageClient'

interface Props {
  params: Promise<{ slug: string }>
}

interface SongMeta {
  title: string
  slug: string
  artwork_url: string | null
  duration_seconds?: number
  lyrics?: string
  description?: string
  release_date?: string | null
  artist: { name: string; slug: string }
  album?: { title: string; slug: string; artwork_url: string | null }
  genre?: { name: string }
}

const getSong = cache(async (slug: string): Promise<SongMeta | null> => {
  try {
    const res = await serverFetch<{ data: SongMeta }>(`/songs/${slug}`)
    return res.data
  } catch {
    return null
  }
})

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
    alternates: { canonical: `/songs/${slug}` },
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

  const jsonLd = song ? {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    url: `https://tesotunes.com/songs/${slug}`,
    image: song.artwork_url || song.album?.artwork_url || undefined,
    byArtist: {
      '@type': 'MusicGroup',
      name: song.artist.name,
      url: `https://tesotunes.com/artists/${song.artist.slug}`,
    },
    inAlbum: song.album ? {
      '@type': 'MusicAlbum',
      name: song.album.title,
      url: `https://tesotunes.com/albums/${song.album.slug}`,
    } : undefined,
    genre: song.genre?.name,
    datePublished: song.release_date || undefined,
    description: song.description || undefined,
  } : null

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <SongDetailPage />
    </>
  )
}
