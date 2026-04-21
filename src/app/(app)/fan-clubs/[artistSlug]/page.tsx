import type { Metadata } from 'next'
import { serverFetch } from '@/lib/api'
import FanClubPageClient from './FanClubPageClient'

interface Props {
  params: Promise<{ artistSlug: string }>
}

interface FanClubMeta {
  name: string
  description: string
  cover_image_url?: string | null
  artist: { name: string; avatar_url?: string | null }
}

async function getFanClubForMeta(artistSlug: string): Promise<FanClubMeta | null> {
  try {
    const res = await serverFetch<{ data: FanClubMeta }>(`/fan-clubs/${artistSlug}`)
    return res.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { artistSlug } = await params
  const club = await getFanClubForMeta(artistSlug)

  if (!club) return { title: 'Fan Club Not Found' }

  const title = club.name
  const description = club.description || `Join the ${club.artist.name} fan club on TesoTunes.`
  const image = club.cover_image_url || club.artist.avatar_url || undefined

  return {
    title,
    description,
    alternates: { canonical: `/fan-clubs/${artistSlug}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description },
  }
}

export default function FanClubPage() {
  return <FanClubPageClient />
}
