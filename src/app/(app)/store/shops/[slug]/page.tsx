"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BadgeCheck,
  Globe,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { mapGenericReviewToFeedItem } from "@/lib/review-feed";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ReviewComposer } from "@/components/reviews/review-composer";
import { ReviewFeed } from "@/components/reviews/review-feed";
import {
  useCreateReview,
  useMarkReviewHelpful,
  useReviews,
} from "@/hooks/useReviews";

interface StoreProductRecord {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  featured_image_url?: string | null;
  average_rating?: number | string | null;
  review_count?: number | null;
  price_ugx?: number | string | null;
  price_credits?: number | null;
  product_type?: string | null;
}

interface StoreRecord {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  banner?: string | null;
  city?: string | null;
  country?: string | null;
  is_verified: boolean;
  rating?: number | string | null;
  review_count?: number | null;
  reviews_count?: number | null;
  products_count: number;
  active_products_count: number;
  metadata?: {
    brand_story?: string | null;
    promoter_profile?: {
      website_url?: string | null;
      location?: string | null;
      audience_summary?: string | null;
      proof_points?: string[];
      campaign_highlights?: string[];
    };
  } | null;
  owner?: {
    display_name?: string | null;
    username?: string | null;
    is_verified?: boolean;
  } | null;
  active_products: StoreProductRecord[];
}

export default function StoreShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { status } = useSession();
  const [showReviewComposer, setShowReviewComposer] = useState(false);

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ["store-shop", slug],
    queryFn: () =>
      apiGet<{ data: StoreRecord }>(`/store/public/stores/${slug}`).then((res) => res.data),
  });

  const { data: reviewsResponse, isLoading: isReviewsLoading } = useReviews(
    "store",
    store?.id ?? 0
  );
  const createReview = useCreateReview();
  const markReviewHelpful = useMarkReviewHelpful("store", store?.id ?? 0);

  const reviews = reviewsResponse?.data.data ?? [];
  const reviewFeedItems = useMemo(
    () => reviews.map((review) => mapGenericReviewToFeedItem(review)),
    [reviews]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Storefront not found</h1>
        <p className="mt-2 text-muted-foreground">
          This shop may be unavailable right now.
        </p>
        <Link href="/store" className="mt-4 inline-flex text-sm text-primary underline">
          Back to store
        </Link>
      </div>
    );
  }

  const proofPoints = store.metadata?.promoter_profile?.proof_points ?? [];
  const highlights = store.metadata?.promoter_profile?.campaign_highlights ?? [];
  const websiteUrl = store.metadata?.promoter_profile?.website_url;
  const ownerName = store.owner?.display_name ?? store.name;
  const storeRating = Number(store.rating ?? 0);
  const storeReviewCount = Number(store.review_count ?? store.reviews_count ?? reviews.length);

  const handleCreateReview = ({
    rating,
    comment,
    wouldRecommend,
  }: {
    rating: number;
    comment: string;
    wouldRecommend: boolean;
  }) => {
    createReview.mutate(
      {
        reviewable_type: "store",
        reviewable_id: store.id,
        rating,
        content: comment,
        metadata: {
          would_recommend: wouldRecommend,
          source: "store_shop_page",
        },
      },
      {
        onSuccess: () => setShowReviewComposer(false),
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>

        <section className="relative overflow-hidden rounded-[32px] border bg-card">
          <div className="absolute inset-0">
            {store.banner ? (
              <Image
                src={`http://tesotunes-api.test/${store.banner}`}
                alt={store.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_38%),linear-gradient(135deg,rgba(17,24,39,0.98),rgba(15,23,42,0.86))]" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.45fr)_360px]">
            <div className="space-y-5 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">
                <ShoppingBag className="h-3.5 w-3.5" />
                Storefront
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {store.name}
                  </h1>
                  {store.is_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified store
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-3xl text-sm text-white/85 md:text-base">
                  {store.metadata?.brand_story || store.description || "A live Tesotunes storefront for direct artist and fan orders."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Managed by {ownerName}
                </span>
                {(store.metadata?.promoter_profile?.location || store.city) ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {store.metadata?.promoter_profile?.location || [store.city, store.country].filter(Boolean).join(", ")}
                  </span>
                ) : null}
                {websiteUrl ? (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/25 p-5 text-white backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                    Rating
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{storeRating.toFixed(1)}</p>
                  <p className="mt-1 text-xs text-white/60">
                    {formatNumber(storeReviewCount)} reviews
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                    Active products
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatNumber(store.active_products_count)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                    Total catalog
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatNumber(store.products_count)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/70">
                Reviews, products, and trust signals now live together on one public storefront.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div className="rounded-[28px] border bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Store highlights
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {store.metadata?.promoter_profile?.audience_summary ||
                  "This storefront is part of the live Tesotunes commerce layer."}
              </p>

              {proofPoints.length ? (
                <div className="mt-4 grid gap-3">
                  {proofPoints.map((point) => (
                    <div key={point} className="rounded-2xl border bg-background/70 px-4 py-3 text-sm text-foreground/85">
                      {point}
                    </div>
                  ))}
                </div>
              ) : null}

              {highlights.length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {highlights.map((highlight, index) => (
                    <div key={`${highlight}-${index}`} className="rounded-2xl border bg-background/70 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Highlight {index + 1}
                      </p>
                      <p className="mt-2 text-sm text-foreground/85">{highlight}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border bg-card p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Buyer trust</p>
                  <h2 className="mt-1 text-2xl font-semibold">Store reviews</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Public feedback for this storefront using the shared Tesotunes review system.
                  </p>
                </div>
                {status === "authenticated" && !showReviewComposer ? (
                  <button
                    onClick={() => setShowReviewComposer(true)}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Leave a review
                  </button>
                ) : null}
              </div>

              {showReviewComposer ? (
                <div className="mt-4">
                  <ReviewComposer
                    title="Leave a store review"
                    description="Share your experience with this storefront."
                    submitLabel={createReview.isPending ? "Submitting..." : "Submit review"}
                    disabled={createReview.isPending}
                    onSubmit={handleCreateReview}
                    onCancel={() => setShowReviewComposer(false)}
                  />
                </div>
              ) : null}

              <div className="mt-4">
                {isReviewsLoading ? (
                  <div className="flex items-center gap-2 rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading store reviews...
                  </div>
                ) : (
                  <ReviewFeed
                    reviews={reviewFeedItems}
                    emptyMessage="No reviews yet. The first store review will appear here."
                    onMarkHelpful={(reviewId, helpful) => {
                      if (typeof reviewId !== "number") return;
                      markReviewHelpful.mutate({ id: reviewId, helpful });
                    }}
                    markingHelpfulId={markReviewHelpful.variables?.id ?? null}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-primary">Catalog</p>
                <h2 className="mt-1 text-2xl font-semibold">Active products</h2>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {formatNumber(store.active_products.length)} live
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {store.active_products.map((product) => (
                <Link
                  key={product.id}
                  href={
                    product.product_type === "promotion"
                      ? `/promotions/${product.slug}`
                      : `/store/products/${product.slug}`
                  }
                  className="grid gap-4 rounded-2xl border bg-background/70 p-4 transition hover:border-primary/30 hover:bg-background"
                >
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                      {product.featured_image_url ? (
                        <Image
                          src={product.featured_image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{product.name}</p>
                        {product.product_type === "promotion" ? (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                            Promotion
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {product.short_description || "Open this product to learn more."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-medium text-primary">
                          {formatCurrency(Number(product.price_ugx ?? 0))}
                        </span>
                        {product.price_credits ? (
                          <span className="text-muted-foreground">
                            {formatNumber(Number(product.price_credits))} credits
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {Number(product.average_rating ?? 0).toFixed(1)} ({formatNumber(Number(product.review_count ?? 0))})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
