import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/lib/api'
import type { Promotion } from '@/types/promotions'
import { PROMOTION_PLATFORM_LABELS } from '@/types/promotions'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL, absoluteUrl } from '@/lib/site'
import PromotionDetailClient from './PromotionDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

const getPromotion = cache(async (slug: string): Promise<Promotion | null> => {
  try {
    const res = await serverFetch<{ data: Promotion }>(`/promotions/${encodeURIComponent(slug)}`, {
      next: { revalidate: 600 },
    } as RequestInit)
    return res.data ?? null
  } catch {
    return null
  }
})

/** The platform as words, or null when the listing doesn't name one. */
function platformLabel(promotion: Promotion): string | null {
  if (!promotion.platform || promotion.platform === 'other') return null
  return PROMOTION_PLATFORM_LABELS[promotion.platform as keyof typeof PROMOTION_PLATFORM_LABELS] ?? promotion.platform
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const promotion = await getPromotion(slug)

  if (!promotion) return { title: 'Promotion not found', robots: { index: false } }

  const platform = platformLabel(promotion)
  const title = `${promotion.title} — ${platform ? `${platform} promotion` : 'music promotion'} by ${promotion.promoter?.name ?? 'a TesoTunes promoter'}`
  const description = (promotion.short_description || promotion.description || title).slice(0, 160)
  const url = absoluteUrl(`/promotions/${promotion.slug}`)
  const image = promotion.featured_image_url || promotion.promoter?.avatar_url || undefined

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image] : undefined },
  }
}

export default async function PromotionPage({ params }: Props) {
  const { slug } = await params
  const promotion = await getPromotion(slug)

  if (!promotion) notFound()

  const url = absoluteUrl(`/promotions/${promotion.slug}`)
  const promoterSlug = promotion.promoter?.profile_slug ?? promotion.promoter?.username

  const service: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: promotion.title,
    description: promotion.description || promotion.short_description || undefined,
    serviceType: platformLabel(promotion) ? `${platformLabel(promotion)} music promotion` : 'Music promotion',
    url,
    image: promotion.featured_image_url || undefined,
    areaServed: promotion.audience_regions?.length ? promotion.audience_regions : undefined,
    provider: promotion.promoter
      ? {
          '@type': 'Person',
          name: promotion.promoter.name,
          url: promoterSlug ? absoluteUrl(`/promoters/${promoterSlug}`) : undefined,
        }
      : undefined,
    // Price only when the service sells for UGX; credits are not a currency.
    offers:
      promotion.price_ugx > 0
        ? { '@type': 'Offer', url, price: promotion.price_ugx, priceCurrency: 'UGX', availability: 'https://schema.org/InStock' }
        : undefined,
  }

  if (promotion.rating_count > 0 && promotion.rating_average > 0) {
    service.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: promotion.rating_average,
      reviewCount: promotion.rating_count,
    }
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Promotion services', item: absoluteUrl('/promotions') },
      { '@type': 'ListItem', position: 3, name: promotion.title, item: url },
    ],
  }

  return (
    <>
      <JsonLd data={service} />
      <JsonLd data={breadcrumb} />
      <PromotionDetailClient />
    </>
  )
}
