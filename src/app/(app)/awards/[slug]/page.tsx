import type { Metadata } from 'next'
import { serverFetch } from '@/lib/api'
import AwardDetailPageClient from './AwardDetailPageClient'

interface Props {
  params: Promise<{ slug: string }>
}

interface AwardMeta {
  name: string
  description?: string
  banner_url?: string
  cover_url?: string
  year?: number
  status?: string
}

async function getAwardForMeta(slug: string): Promise<AwardMeta | null> {
  try {
    const res = await serverFetch<{ data: AwardMeta }>(`/awards/${slug}`)
    return res.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const award = await getAwardForMeta(slug)

  if (!award) return { title: 'Awards Not Found' }

  const title = award.year ? `${award.name} ${award.year}` : award.name
  const description = award.description || `Vote for your favourite artists in the ${title} on TesoTunes.`
  const image = award.banner_url || award.cover_url || undefined

  return {
    title,
    description,
    alternates: { canonical: `/awards/${slug}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description },
  }
}

export default function AwardPage() {
  return <AwardDetailPageClient />
}
