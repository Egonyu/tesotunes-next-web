import type { Metadata } from 'next'
import { cache } from 'react'
import { serverFetch } from '@/lib/api'
import { JsonLd } from '@/components/seo/JsonLd'
import EventDetailPageClient from './EventDetailPageClient'

interface Props {
  params: Promise<{ id: string }>
}

interface EventMeta {
  id: number
  title: string
  description?: string
  cover_image?: string
  banner_url?: string
  category?: string
  starts_at?: string
  start_date?: string
}

const getEventForMeta = cache(async (id: string): Promise<EventMeta | null> => {
  try {
    const res = await serverFetch<{ data: EventMeta }>(`/events/${id}`)
    return res.data
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await getEventForMeta(id)

  if (!event) return { title: 'Event Not Found' }

  const title = event.title
  const description = event.description || `${event.title} — get tickets on TesoTunes.`
  const image = event.cover_image || event.banner_url || undefined

  return {
    title,
    description,
    alternates: { canonical: `/events/${id}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description, images: image ? [image] : undefined },
  }
}

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const event = await getEventForMeta(id)

  const jsonLd = event ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || undefined,
    url: `https://tesotunes.com/events/${id}`,
    image: event.cover_image || event.banner_url || undefined,
    startDate: event.starts_at || event.start_date || undefined,
    location: {
      '@type': 'Place',
      name: 'TesoTunes Event',
    },
    organizer: {
      '@type': 'Organization',
      name: 'TesoTunes',
      url: 'https://tesotunes.com',
    },
  } : null

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tesotunes.com' },
      { '@type': 'ListItem', position: 2, name: 'Events', item: 'https://tesotunes.com/events' },
      { '@type': 'ListItem', position: 3, name: event?.title ?? id, item: `https://tesotunes.com/events/${id}` },
    ],
  }

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <JsonLd data={breadcrumb} />
      <EventDetailPageClient />
    </>
  )
}
