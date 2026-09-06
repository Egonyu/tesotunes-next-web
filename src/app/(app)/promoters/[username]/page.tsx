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
  Inbox,
  Link2,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { PromotionCard } from "@/components/promotions";
import { ReviewFeed } from "@/components/reviews/review-feed";
import { usePromoterProfile } from "@/hooks/usePromotions";
import * as reviewsApi from "@/lib/reviews-api";
import { mapGenericReviewToFeedItem } from "@/lib/review-feed";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { reviewKeys } from "@/hooks/useReviews";
import {
  PROMOTION_AUDIENCE_NICHE_LABELS,
  PROMOTION_PLATFORM_LABELS,
  type PublicPromoterProfile,
  type PromotionListItem,
  type PromotionPlatform,
} from "@/types/promotions";

const SOCIAL_LABELS: Array<{
  key: keyof PublicPromoterProfile["social_links"];
  label: string;
}> = [
  { key: "instagram_url", label: "Instagram" },
  { key: "tiktok_url", label: "TikTok" },
  { key: "youtube_url", label: "YouTube" },
  { key: "facebook_url", label: "Facebook" },
  { key: "twitter_url", label: "X / Twitter" },
  { key: "website_url", label: "Website" },
];

function lowestPrice(listings: PromotionListItem[]) {
  if (!listings.length) {
    return null;
  }

  return {
    credits: Math.min(...listings.map((listing) => listing.price_credits)),
    ugx: Math.min(...listings.map((listing) => listing.price_ugx)),
  };
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-4 sm:p-5", className)}>
      {children}
    </section>
  );
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** A three-up grid — the page's default shape at every breakpoint. */
function TriGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-2 sm:gap-3">{children}</div>;
}

function Chips({ values, empty }: { values: string[]; empty: string }) {
  if (values.length === 0) {
    return <p className="text-xs text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function EmptyBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-8 text-center">
      <Inbox className="mx-auto h-6 w-6 text-muted-foreground" />
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PromoterProfilePage() {
  const params = useParams();
  const slug = params.username as string;
  const queryClient = useQueryClient();
  const { data: promoter, isLoading, isError } = usePromoterProfile(slug);

  /**
   * Everything derived from the profile is computed before the early returns
   * below, and every hook runs unconditionally — the page previously called
   * hooks after its loading return, so the hook count changed between renders
   * and React refused to render it at all.
   */
  const listings = promoter?.promotions ?? [];

  const socialLinks = SOCIAL_LABELS.flatMap(({ key, label }) => {
    const href = promoter?.social_links?.[key];
    return href ? [{ href, label }] : [];
  });

  const reviewSourcePromotions = listings.slice(0, 3);

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
    mutationFn: ({ reviewId, helpful }) =>
      reviewsApi.markReviewHelpful(reviewId, helpful),
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
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [promotionReviewQueries, reviewSourcePromotions]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !promoter) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">Promoter not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This profile is unavailable right now.
        </p>
        <Link
          href="/promotions"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Browse promotions
        </Link>
      </div>
    );
  }

  const isNew = promoter.completed_orders === 0 && promoter.review_count === 0;
  const from = lowestPrice(listings);
  const hasPastWork =
    (promoter.portfolio_items?.length ?? 0) > 0 ||
    (promoter.proof_points?.length ?? 0) > 0 ||
    (promoter.campaign_highlights?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <Link
        href="/promotions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Promotions
      </Link>

      {/* Identity */}
      <Card>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-muted sm:h-20 sm:w-20">
            {promoter.avatar_url ? (
              <Image
                src={promoter.avatar_url}
                alt={promoter.display_name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                {promoter.display_name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {promoter.display_name}
              </h1>
              {promoter.is_verified && (
                /*
                 * "ID verified" rather than "Verified promoter": what the badge
                 * certifies is that this person's identity was checked, not
                 * that their work was. Every promoter on the platform carries
                 * it, several with no completed jobs, so the broader wording
                 * was vouching for something nobody had checked.
                 */
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  ID verified
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  New promoter
                </span>
              )}
            </div>

            <p className="mt-0.5 text-sm text-muted-foreground">
              @{promoter.username}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {promoter.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {promoter.location}
                </span>
              )}
              {promoter.response_time_hours ? (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  Replies in ~{promoter.response_time_hours}h
                </span>
              ) : null}
              {promoter.onboarded_at && (
                <span>
                  Joined{" "}
                  {new Date(promoter.onboarded_at).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {promoter.bio?.trim() && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {promoter.bio}
          </p>
        )}
      </Card>

      {/* Track record */}
      <Card>
        <SectionHeading title="Track record" />
        <TriGrid>
          {[
            { value: formatNumber(promoter.completed_orders), label: "Jobs done" },
            {
              value:
                promoter.review_count > 0
                  ? promoter.average_rating.toFixed(1)
                  : "—",
              label: "Rating",
              icon: promoter.review_count > 0,
            },
            { value: formatNumber(promoter.review_count), label: "Reviews" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-muted/50 px-2 py-3 text-center">
              <p className="flex items-center justify-center gap-1 text-lg font-bold tabular-nums sm:text-xl">
                {stat.icon && (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                )}
                {stat.value}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </TriGrid>

        {isNew && (
          <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-foreground">
            No completed work on TesoTunes yet. Agree the deliverables in writing and
            pay through the platform — your money is held until you confirm delivery.
          </p>
        )}
      </Card>

      {/* Contact — three actions, equal weight on the grid */}
      <TriGrid>
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-primary px-2 py-4 text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Send className="h-4 w-4" />
          <span className="text-xs font-semibold">Request a quote</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card px-2 py-4 transition-colors hover:bg-muted/50"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Message</span>
        </button>
        <Link
          href="/promotions"
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card px-2 py-4 transition-colors hover:bg-muted/50"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Compare</span>
        </Link>
      </TriGrid>

      {/* Reach — three columns, one per dimension */}
      <Card>
        <SectionHeading title="Reach they claim" />
        <TriGrid>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Platforms
            </p>
            <Chips
              values={promoter.platforms.map(
                (platform) =>
                  PROMOTION_PLATFORM_LABELS[platform as PromotionPlatform] ?? platform
              )}
              empty="None listed"
            />
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Genres
            </p>
            <Chips
              values={(promoter.niches ?? []).map(
                (niche) =>
                  PROMOTION_AUDIENCE_NICHE_LABELS[
                    niche as keyof typeof PROMOTION_AUDIENCE_NICHE_LABELS
                  ] ?? niche
              )}
              empty="None listed"
            />
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Regions
            </p>
            <Chips values={promoter.audience_regions ?? []} empty="None listed" />
          </div>
        </TriGrid>

        {promoter.audience_summary?.trim() && (
          <p className="mt-3 text-sm text-muted-foreground">
            {promoter.audience_summary}
          </p>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Self-reported. TesoTunes has not checked audience size or engagement.
        </p>
      </Card>

      {/* Services */}
      <Card>
        <SectionHeading
          title={from ? `Services from ${formatNumber(from.credits)} credits` : "Services"}
          action={{ href: "/promotions", label: "Marketplace" }}
        />
        {listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
            {from && (
              <p className="mt-3 text-xs text-muted-foreground">
                Lowest listed price is {formatCurrency(from.ugx)}.
              </p>
            )}
          </>
        ) : (
          <EmptyBlock
            title="No set packages yet"
            description="They haven't listed fixed services — send a brief and ask for a quote instead."
          />
        )}
      </Card>

      {/* Past work */}
      <Card>
        <SectionHeading title="Past work" />
        {hasPastWork ? (
          <div className="space-y-4">
            {promoter.portfolio_items?.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promoter.portfolio_items.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="overflow-hidden rounded-xl border bg-muted/30"
                  >
                    {item.asset_url && (
                      <div className="relative h-32">
                        <Image
                          src={item.asset_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.summary && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.summary}
                        </p>
                      )}
                      {item.outcome && (
                        <p className="mt-2 text-xs font-medium">
                          Outcome: {item.outcome}
                        </p>
                      )}
                      {item.external_url && (
                        <a
                          href={item.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Link2 className="h-3 w-3" />
                          Open
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {(promoter.proof_points?.length ||
              promoter.campaign_highlights?.length) && (
              <TriGrid>
                {[
                  ...(promoter.proof_points ?? []),
                  ...(promoter.campaign_highlights ?? []),
                ].map((point, index) => (
                  <p
                    key={`${point}-${index}`}
                    className="rounded-xl bg-muted/50 p-3 text-xs leading-relaxed"
                  >
                    {point}
                  </p>
                ))}
              </TriGrid>
            )}
          </div>
        ) : (
          <EmptyBlock
            title="Nothing shared"
            description="No campaigns or references on file. Ask for examples before you commit."
          />
        )}
      </Card>

      {/* Reviews */}
      <Card>
        <SectionHeading title="What artists say" />
        <ReviewFeed
          reviews={storefrontReviews}
          emptyMessage="No reviews yet — the first artist to hire them writes it."
          onMarkHelpful={(reviewId, helpful) => {
            /*
             * Feed ids are namespaced "<promotionId>:<reviewId>" so reviews
             * from several listings can share one feed; the promotion id is
             * what the cache has to be invalidated against.
             */
            if (typeof reviewId !== "string") return;

            const [reviewableRaw, reviewRaw] = reviewId.split(":");
            const reviewableId = Number(reviewableRaw);
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
      </Card>

      {/* Hiring safely — three steps, not an explainer */}
      <Card>
        <SectionHeading title="Hiring safely" />
        <TriGrid>
          {[
            { n: 1, t: "Send a brief", s: "Track, budget, deadline." },
            { n: 2, t: "Pay in-platform", s: "Held until you confirm." },
            { n: 3, t: "Leave a review", s: "The next artist reads it." },
          ].map((step) => (
            <div key={step.n} className="rounded-xl bg-muted/50 p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {step.n}
              </span>
              <p className="mt-2 text-xs font-semibold leading-tight">{step.t}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {step.s}
              </p>
            </div>
          ))}
        </TriGrid>
      </Card>

      {/* Links */}
      {socialLinks.length > 0 && (
        <Card>
          <SectionHeading title="Elsewhere" />
          <TriGrid>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors hover:bg-muted/50"
              >
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-medium">{link.label}</span>
              </a>
            ))}
          </TriGrid>
        </Card>
      )}
    </div>
  );
}
