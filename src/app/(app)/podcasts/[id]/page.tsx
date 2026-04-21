import type { Metadata } from 'next'
import { serverFetch } from '@/lib/api'
import PodcastDetailPage from './PodcastPageClient'

interface Props {
  params: Promise<{ id: string }>
}

interface PodcastMeta {
  id: number
  title: string
  description: string
  cover_url: string
  host_name: string
  category?: { name: string }
}

async function getPodcastForMeta(id: string): Promise<PodcastMeta | null> {
  try {
    const res = await serverFetch<{ data: PodcastMeta }>(`/podcasts/${id}`)
    return res.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const podcast = await getPodcastForMeta(id)

  if (!podcast) return { title: 'Podcast Not Found' }

  const title = podcast.title
  const description = podcast.description || `${podcast.title} — hosted by ${podcast.host_name} on TesoTunes.`
  const image = podcast.cover_url || undefined

  return {
    title,
    description,
    alternates: { canonical: `/podcasts/${id}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description, images: image ? [image] : undefined },
  }
}

export default function PodcastPage() {
  return <PodcastDetailPage />
}
