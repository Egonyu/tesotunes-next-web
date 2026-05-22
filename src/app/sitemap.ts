import type { MetadataRoute } from 'next'
import { serverFetch } from '@/lib/api'
import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL

async function fetchList<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await serverFetch<{ data: T[] }>(endpoint, {
      next: { revalidate: 3600 },
    } as RequestInit)
    return res.data || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artists, albums, genres, songs, events] = await Promise.all([
    fetchList<{ slug: string; updated_at?: string }>('/artists?limit=500&status=active'),
    fetchList<{ slug: string; updated_at?: string }>('/albums?limit=500&status=published'),
    fetchList<{ slug: string; updated_at?: string }>('/genres?limit=100'),
    fetchList<{ slug: string; updated_at?: string }>('/songs?limit=500&status=published'),
    fetchList<{ id: number; updated_at?: string }>('/events?limit=200&status=published'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/artists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/albums`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/genres`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/browse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/podcasts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/awards`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/fan-clubs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const artistRoutes: MetadataRoute.Sitemap = artists
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${BASE_URL}/artists/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const albumRoutes: MetadataRoute.Sitemap = albums
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${BASE_URL}/albums/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  const genreRoutes: MetadataRoute.Sitemap = genres
    .filter((g) => g.slug)
    .map((g) => ({
      url: `${BASE_URL}/genres/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const songRoutes: MetadataRoute.Sitemap = songs
    .filter((s) => s.slug)
    .map((s) => ({
      url: `${BASE_URL}/songs/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...artistRoutes,
    ...albumRoutes,
    ...genreRoutes,
    ...songRoutes,
    ...eventRoutes,
  ]
}
