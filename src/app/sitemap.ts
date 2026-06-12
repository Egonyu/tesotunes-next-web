import type { MetadataRoute } from 'next'
import { serverFetch } from '@/lib/api'
import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL

async function fetchList<T>(endpoint: string, label: string): Promise<T[]> {
  try {
    const res = await serverFetch<{ data: T[] }>(endpoint, {
      next: { revalidate: 3600 },
    } as RequestInit)
    const results = res.data || []
    if (results.length === 0) {
      console.warn(`[sitemap] ${label} returned 0 results from ${endpoint}`)
    }
    return results
  } catch (err) {
    console.error(`[sitemap] Failed to fetch ${label} (${endpoint}):`, err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Backend caps per_page at 100 for songs/artists/albums.
  // Revalidate every hour; Next.js de-dupes concurrent calls within the same
  // revalidation window so these only hit the API once per hour.
  const [artists, albums, genres, songs, events] = await Promise.all([
    fetchList<{ slug: string; updated_at?: string }>('/artists?per_page=100', 'artists'),
    fetchList<{ slug: string; updated_at?: string }>('/albums?per_page=100', 'albums'),
    fetchList<{ slug: string; updated_at?: string }>('/genres', 'genres'),
    fetchList<{ slug: string; updated_at?: string }>('/songs?per_page=100', 'songs'),
    fetchList<{ id: number; updated_at?: string }>('/events?limit=100&status=published', 'events'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/artists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/albums`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/songs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/genres`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/charts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/new-releases`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/browse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/podcasts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/playlists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/moods`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/radio`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/awards`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/fan-clubs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/promoters`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/become-artist`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const artistRoutes: MetadataRoute.Sitemap = artists
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${BASE_URL}/artists/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const albumRoutes: MetadataRoute.Sitemap = albums
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${BASE_URL}/albums/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const genreRoutes: MetadataRoute.Sitemap = genres
    .filter((g) => g.slug)
    .map((g) => ({
      url: `${BASE_URL}/genres/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  const songRoutes: MetadataRoute.Sitemap = songs
    .filter((s) => s.slug)
    .map((s) => ({
      url: `${BASE_URL}/songs/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
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
