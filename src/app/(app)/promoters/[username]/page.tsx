"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  Globe,
  Loader2,
  MapPin,
  Megaphone,
  Radio,
  Sparkles,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { PromotionCard, PromotionsEmptyState } from "@/components/promotions";
import { ReviewFeed } from "@/components/reviews/review-feed";
import { promotionKeys, usePromoterProfile } from "@/hooks/usePromotions";
import * as reviewsApi from "@/lib/reviews-api";
import { mapGenericReviewToFeedItem } from "@/lib/review-feed";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { reviewKeys } from "@/hooks/useReviews";
import {
  PROMOTION_AUDIENCE_NICHE_LABELS,
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
  type PromoterProfile,
} from "@/types/promotions";

const SOCIAL_LABELS: Array<{
  key: keyof PromoterProfile["social_links"];
  label: string;
}> = [
  { key: "instagram_url", label: "Instagram" },
  { key: "tiktok_url", label: "TikTok" },
  { key: "youtube_url", label: "YouTube" },
  { key: "facebook_url", label: "Facebook" },
  { key: "twitter_url", label: "X / Twitter" },
  { key: "website_url", label: "Website" },
];

function averagePrice(promoter: PromoterProfile) {
  if (!promoter.promotions.length) {
    return null;
  }

  const totalCredits = promoter.promotions.reduce(
    (sum, promo) => sum + promo.price_credits,
    0
  );
  const totalUgx = promoter.promotions.reduce(
    (sum, promo) => sum + promo.price_ugx,
    0
  );

  return {
    credits: Math.round(totalCredits / promoter.promotions.length),
    ugx: Math.round(totalUgx / promoter.promotions.length),
  };
}

function uniqueValues(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.filter(Boolean))) as string[];
}

function buildAudienceHighlights(promoter: PromoterProfile) {
  return uniqueValues(
    promoter.promotions.flatMap((promotion) => promotion.audience_niches ?? [])
  ).slice(0, 5);
}

function buildCoverageHighlights(promoter: PromoterProfile) {
  return uniqueValues(promoter.promotions.flatMap((promotion) => promotion.audience_regions ?? [])).slice(0, 4);
}

function storefrontHeadline(promoter: PromoterProfile) {
  const firstPlatform = promoter.platforms[0];
  const firstType = promoter.service_types[0];

  if (!firstPlatform && !firstType) {
    return "Promotion services for artists who need trusted reach.";
  }

  const platformLabel = firstPlatform
    ? PROMOTION_PLATFORM_LABELS[firstPlatform]
    : "creator";
  const typeLabel = firstType
    ? PROMOTION_TYPE_LABELS[firstType]
    : "promotion support";

  return `${platformLabel} promoter offering ${typeLabel.toLowerCase()} for artists ready to grow a release.`;
}

export default function PromoterProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const queryClient = useQueryClient();
  const { data: promoter, isLoading, isError } = usePromoterProfile(username);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !promoter) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Promoter Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          This promoter profile is unavailable right now.
        </p>
        <Link href="/promotions" className="mt-4 inline-flex text-sm text-primary underline">
          Browse promotions
        </Link>
      </div>
    );
  }

  const socialLinks = SOCIAL_LABELS.flatMap(({ key, label }) => {
    const href = promoter.social_links?.[key];
    return href ? [{ href, label }] : [];
  });

  const featuredPromotion = promoter.promotions[0] ?? null;
  const avgPrice = averagePrice(promoter);
  const audienceHighlights = buildAudienceHighlights(promoter);
  const coverageHighlights = buildCoverageHighlights(promoter);
  const reviewSourcePromotions = promoter.promotions.slice(0, 3);

  const promotionReviewQueries = useQueries({
    queries: reviewSourcePromotions.map((promotion) => ({
      queryKey: reviewKeys.list("product", promotion.id, 1),
      queryFn: () => reviewsApi.fetchReviews("product", promotion.id, 1),
      enabled: promotion.status === "active",
      staleTime: 1000 * 60 * 5,
    })),
  });

  const markReviewHelpful = useMutation<
    unknown,
    Error,
    { reviewId: number; helpful: boolean; reviewableId: number }
  >({
    mutationFn: ({
      reviewId,
      helpful,
    }: {
      reviewId: number;
      helpful: boolean;
    }) => reviewsApi.markReviewHelpful(reviewId, helpful),
    onSuccess: (_response, variables) => {
      const sourcePromotion = reviewSourcePromotions.find(
        (promotion) => promotion.id === variables.reviewableId
      );

      if (sourcePromotion) {
        queryClient.invalidateQueries({
          queryKey: reviewKeys.list("product", sourcePromotion.id, 1),
        });
      }
    },
  });

  const storefrontReviews = useMemo(() => {
    return promotionReviewQueries
      .flatMap((query, index) => {
        const promotion = reviewSourcePromotions[index];
        const reviews = query.data?.data.data ?? [];

        return reviews.map((review) =>
          mapGenericReviewToFeedItem(review, {
            idPrefix: String(promotion.id),
            contextLabel: `From ${promotion.title}`,
          })
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [promotionReviewQueries, reviewSourcePromotions]);

  const isStorefrontReviewsLoading = promotionReviewQueries.some((query) => query.isLoading);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <Link
          href="/promotions"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to promotions marketplace
        </Link>

        <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/95 shadow-xl shadow-black/5">
          <div className="absolute inset-0">
            {promoter.banner_url ? (
              <Image
                src={promoter.banner_url}
                alt={`${promoter.name} banner`}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.24),transparent_38%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.88))]" />
            )}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,10,17,0.94),rgba(10,14,22,0.78)_45%,rgba(10,14,22,0.3))]" />

          <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.65fr)_360px] lg:px-8 lg:py-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
                <Megaphone className="h-3.5 w-3.5" />
                Promoter Storefront
              </div>

              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-lg shadow-black/20">
                  {promoter.avatar_url ? (
                    <Image
                      src={promoter.avatar_url}
                      alt={promoter.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/10 text-3xl font-bold text-white">
                      {promoter.name.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        {promoter.name}
                      </h1>
                      {promoter.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified promoter
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-white/65">@{promoter.username}</p>
                  </div>

                  <p className="max-w-3xl text-sm leading-6 text-white/85 md:text-base">
                    {promoter.bio?.trim() || storefrontHeadline(promoter)}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/75">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {formatNumber(promoter.follower_count)} followers
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {promoter.average_rating.toFixed(1)} average rating
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {promoter.location || "East Africa"}
                    </span>
                    {promoter.response_time_hours ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" />
                        Replies in about {promoter.response_time_hours}h
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                    Live Services
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {promoter.active_promotions}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                    Completed Orders
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatNumber(promoter.completed_orders)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                    Starting Point
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {avgPrice ? `${formatNumber(avgPrice.credits)} cr` : "--"}
                  </p>
                  {avgPrice ? (
                    <p className="mt-1 text-xs text-white/60">
                      About {formatCurrency(avgPrice.ugx)}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                    Coverage
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {promoter.platforms.length}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Platforms or channels
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {promoter.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur"
                  >
                    {PROMOTION_PLATFORM_LABELS[platform]}
                  </span>
                ))}
                {promoter.service_types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs font-medium text-rose-100"
                  >
                    {PROMOTION_TYPE_LABELS[type]}
                  </span>
                ))}
              </div>

              {socialLinks.length ? (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white/90 transition hover:bg-black/30"
                    >
                      {link.label === "Website" ? (
                        <Globe className="h-3.5 w-3.5" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                  Artist Fit
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Why artists book this promoter
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  This storefront is built for artists who want clear audience fit,
                  verified delivery, and measurable promotion outcomes.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="h-4 w-4 text-rose-300" />
                    <p className="font-medium">Audience fit</p>
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    {promoter.audience_summary?.trim() ||
                      "Audience and creator lane details come from the seller's live storefront and active services."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Radio className="h-4 w-4 text-amber-300" />
                    <p className="font-medium">Service lanes</p>
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    {promoter.service_types.length
                      ? promoter.service_types
                          .map((type) => PROMOTION_TYPE_LABELS[type])
                          .slice(0, 3)
                          .join(", ")
                      : "Promotion services available on request."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Ticket className="h-4 w-4 text-emerald-300" />
                    <p className="font-medium">Buying path</p>
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    Artists can book a live service, submit campaign proof, and
                    track delivery through Tesotunes.
                  </p>
                </div>
              </div>

              {featuredPromotion ? (
                <Link
                  href={`/promotions/${featuredPromotion.slug}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Featured Service
                  </p>
                  <h3 className="mt-2 font-semibold text-white">
                    {featuredPromotion.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/65">
                    {featuredPromotion.short_description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-white/80">
                    <span>{formatNumber(featuredPromotion.price_credits)} credits</span>
                    <span>{formatCurrency(featuredPromotion.price_ugx)}</span>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-border/60 bg-card/90 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Marketplace signals
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-sm font-semibold">Audience niches</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {audienceHighlights.length ? (
                      audienceHighlights.map((niche) => (
                        <span
                          key={niche}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {PROMOTION_AUDIENCE_NICHE_LABELS[
                            niche as keyof typeof PROMOTION_AUDIENCE_NICHE_LABELS
                          ] ?? niche}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Audience niche data will show here as services are refined.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-sm font-semibold">Coverage regions</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coverageHighlights.length ? (
                      coverageHighlights.map((region) => (
                        <span
                          key={region}
                          className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground/80"
                        >
                          {region}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Regional targeting will show here when defined on services.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {promoter.portfolio_items?.length ? (
              <div className="rounded-[28px] border border-border/60 bg-card/90 p-6">
                <h2 className="text-lg font-semibold">Portfolio snapshots</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Real campaign examples, outcomes, and reference assets from this promoter.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {promoter.portfolio_items.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="overflow-hidden rounded-2xl border border-border/60 bg-background/70"
                    >
                      {item.asset_url ? (
                        <div className="relative h-40">
                          <Image
                            src={item.asset_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{item.title}</p>
                          {item.platform ? (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                              {PROMOTION_PLATFORM_LABELS[item.platform]}
                            </span>
                          ) : null}
                        </div>
                        {item.summary ? (
                          <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                        ) : null}
                        {item.outcome ? (
                          <div className="mt-3 rounded-2xl border border-border/60 bg-card px-3 py-2 text-sm font-medium text-foreground/85">
                            Outcome: {item.outcome}
                          </div>
                        ) : null}
                        {item.external_url ? (
                          <a
                            href={item.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex text-sm font-medium text-primary transition hover:text-primary/80"
                          >
                            Open reference
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {promoter.proof_points?.length ? (
              <div className="rounded-[28px] border border-border/60 bg-card/90 p-6">
                <h2 className="text-lg font-semibold">Proof of performance</h2>
                <div className="mt-4 grid gap-3">
                  {promoter.proof_points.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground/85"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[28px] border border-border/60 bg-card/90 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Buyer trust</p>
                  <h2 className="mt-1 text-2xl font-semibold">What artists say</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reviews pulled from this promoter&apos;s live services across the marketplace.
                  </p>
                </div>
                {featuredPromotion ? (
                  <Link
                    href={`/promotions/${featuredPromotion.slug}`}
                    className="inline-flex items-center text-sm font-medium text-primary transition hover:text-primary/80"
                  >
                    Book featured service
                  </Link>
                ) : null}
              </div>

              <div className="mt-4">
                {isStorefrontReviewsLoading && storefrontReviews.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading storefront reviews...
                  </div>
                ) : (
                  <ReviewFeed
                    reviews={storefrontReviews}
                    emptyMessage="No completed buyer reviews yet. Reviews will appear here as marketplace orders close out."
                    onMarkHelpful={(reviewId, helpful) => {
                      if (typeof reviewId !== "string") return;
                      const [reviewableIdRaw, reviewRaw] = reviewId.split(":");
                      const reviewableId = Number(reviewableIdRaw);
                      const numericReviewId = Number(reviewRaw);

                      if (!Number.isFinite(reviewableId) || !Number.isFinite(numericReviewId)) {
                        return;
                      }

                      markReviewHelpful.mutate({
                        reviewId: numericReviewId,
                        helpful,
                        reviewableId,
                      });
                    }}
                    markingHelpfulId={
                      markReviewHelpful.variables
                        ? `${markReviewHelpful.variables.reviewableId}:${markReviewHelpful.variables.reviewId}`
                        : null
                    }
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {promoter.campaign_highlights?.length ? (
              <div className="rounded-[28px] border border-border/60 bg-card/90 p-6">
                <h2 className="text-lg font-semibold">Campaign highlights</h2>
                <div className="mt-4 space-y-3">
                  {promoter.campaign_highlights.map((highlight, index) => (
                    <div
                      key={`${highlight}-${index}`}
                      className="rounded-2xl border border-border/60 bg-background/70 p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Highlight {index + 1}
                      </p>
                      <p className="mt-2 text-sm text-foreground/85">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[28px] border border-border/60 bg-card/90 p-6">
              <h2 className="text-lg font-semibold">Book with confidence</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-medium">Secure checkout</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tesotunes supports credits, UGX wallet, and hybrid payment for promotion services.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-medium">Verification flow</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Buyers submit proof, sellers verify delivery, and admin can resolve disputes when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-border/60 bg-card/90 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Live storefront</p>
              <h2 className="mt-1 text-2xl font-semibold">Active services from {promoter.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                These are the current offers artists can book through Tesotunes.
              </p>
            </div>
            <Link
              href="/promotions"
              className="inline-flex items-center text-sm font-medium text-primary transition hover:text-primary/80"
            >
              Explore full marketplace
            </Link>
          </div>

          {promoter.promotions.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {promoter.promotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          ) : (
            <PromotionsEmptyState
              title="No active services"
              description="This promoter does not have active promotion listings at the moment."
            />
          )}
        </section>
      </div>
    </div>
  );
}
