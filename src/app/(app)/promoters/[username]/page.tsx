import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/lib/api'
import type { PublicPromoterProfile } from '@/types/promotions'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL, absoluteUrl } from '@/lib/site'
import PromoterProfileClient from './PromoterProfileClient'

interface Props {
  params: Promise<{ username: string }>
}

const getPromoter = cache(async (slug: string): Promise<PublicPromoterProfile | null> => {
  try {
    const res = await serverFetch<{ data: PublicPromoterProfile }>(`/promoters/${encodeURIComponent(slug)}`, {
      next: { revalidate: 600 },
    } as RequestInit)
    return res.data ?? null
  } catch {
    return null
  }
})

function describe(promoter: PublicPromoterProfile): string {
  if (promoter.bio) return promoter.bio.slice(0, 160)

  const platforms = promoter.platforms.slice(0, 3).join(', ')
  const regions = promoter.audience_regions.slice(0, 2).join(' and ')
  const parts = [
    `${promoter.display_name} promotes music on TesoTunes`,
    platforms ? `on ${platforms}` : '',
    regions ? `for audiences in ${regions}` : '',
  ].filter(Boolean)

  return `${parts.join(' ')}. Book a promotion service with payment held until you accept the delivery.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const promoter = await getPromoter(username)

  if (!promoter) return { title: 'Promoter not found', robots: { index: false } }

  const title = `${promoter.display_name} — music promoter`
  const description = describe(promoter)
  const url = absoluteUrl(`/promoters/${promoter.slug}`)
  const image = promoter.avatar_url || undefined

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary', title, description, images: image ? [image] : undefined },
  }
}

export default async function PromoterPage({ params }: Props) {
  const { username } = await params
  const promoter = await getPromoter(username)

  if (!promoter) notFound()

  const url = absoluteUrl(`/promoters/${promoter.slug}`)
  const sameAs = Object.values(promoter.social_links ?? {}).filter(
    (link): link is string => typeof link === 'string' && /^https?:\/\//.test(link),
  )

  const profile: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      name: promoter.display_name,
      url,
      image: promoter.avatar_url || undefined,
      description: promoter.bio || undefined,
      knowsAbout: promoter.niches.length ? promoter.niches : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
      makesOffer: promoter.promotions.map((service) => ({
        '@type': 'Offer',
        url: absoluteUrl(`/promotions/${service.slug}`),
        ...(service.price_ugx > 0 ? { price: service.price_ugx, priceCurrency: 'UGX' } : {}),
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.short_description || undefined,
          serviceType: 'Music promotion',
        },
      })),
    },
  }

  // Only real reviews produce a rating; never an empty or invented one.
  if (promoter.review_count > 0 && promoter.average_rating > 0) {
    ;(profile.mainEntity as Record<string, unknown>).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: promoter.average_rating,
      reviewCount: promoter.review_count,
    }
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Promoters', item: absoluteUrl('/promoters') },
      { '@type': 'ListItem', position: 3, name: promoter.display_name, item: url },
    ],
  }

  return (
    <>
      <JsonLd data={profile} />
      <JsonLd data={breadcrumb} />
      <PromoterProfileClient />
    </>
  )
}
