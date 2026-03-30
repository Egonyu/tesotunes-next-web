"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Coins,
  Filter,
  Loader2,
  Megaphone,
  Radio,
  Sparkles,
  Store,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  PromotionCard,
  PromotionFilters,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import { usePromotions } from "@/hooks/usePromotions";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { usePromotionsStore } from "@/stores/promotions";
import type { BrowsePromotionsParams, PromotionListItem } from "@/types/promotions";

type RecommendationLane = {
  key: string;
  title: string;
  note: string;
  actionLabel: string;
  filters: Partial<BrowsePromotionsParams>;
  promotion: PromotionListItem;
};

function labelFromSlug(value: string | null | undefined) {
  if (!value) return "Other";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function PromotionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="aspect-[16/9] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function buildRecommendationLanes(promotions: PromotionListItem[]): RecommendationLane[] {
  if (!promotions.length) {
    return [];
  }

  const verified = promotions.filter((promotion) => promotion.promoter.is_verified);
  const fastest = [...promotions].sort(
    (a, b) => a.delivery_days_min - b.delivery_days_min || b.rating_average - a.rating_average
  )[0];
  const biggestReach = [...promotions].sort(
    (a, b) => b.estimated_reach - a.estimated_reach || b.rating_average - a.rating_average
  )[0];
  const bestRated = [...promotions].sort(
    (a, b) => b.rating_average - a.rating_average || b.completed_orders - a.completed_orders
  )[0];
  const radio = promotions.find((promotion) => promotion.platform === "radio");
  const club = promotions.find((promotion) => promotion.platform === "club");

  return [
    fastest
      ? {
          key: "fast_turn",
          title: "Fast-turn launch support",
          note: "Prioritise quick delivery when release timing matters most.",
          actionLabel: "Show fast-turn offers",
          filters: {
            platform: fastest.platform,
            delivery_days_max: fastest.delivery_days_max,
            sort: "best_match",
          },
          promotion: fastest,
        }
      : null,
    biggestReach
      ? {
          key: "big_reach",
          title: "Maximum audience reach",
          note: "Great for artists who want the widest available visibility lane.",
          actionLabel: "Show highest reach",
          filters: {
            platform: biggestReach.platform,
            min_reach: biggestReach.estimated_reach,
            sort: "best_match",
          },
          promotion: biggestReach,
        }
      : null,
    bestRated
      ? {
          key: "trusted",
          title: "Most trusted storefronts",
          note: "Lean into stronger ratings, completed orders, and proven delivery.",
          actionLabel: "Show trusted offers",
          filters: {
            platform: bestRated.platform,
            rating_min: Math.max(4, Math.floor(bestRated.rating_average)),
            verified: verified.length > 0 || undefined,
            sort: "best_match",
          },
          promotion: bestRated,
        }
      : null,
    radio
      ? {
          key: "radio",
          title: "Regional radio placement",
          note: "Useful for songs that need presenter context and broadcast proof.",
          actionLabel: "Show radio fits",
          filters: {
            platform: "radio",
            proof_type: radio.platform_specifics?.proof,
            sort: "best_match",
          },
          promotion: radio,
        }
      : club
        ? {
            key: "club",
            title: "Nightlife and DJ energy",
            note: "For club-ready releases that need venue context and recap proof.",
            actionLabel: "Show DJ and club fits",
            filters: {
              platform: "club",
              placement: club.platform_specifics?.placement,
              sort: "best_match",
            },
            promotion: club,
          }
        : null,
  ].filter(Boolean) as RecommendationLane[];
}

export default function PromotionsBrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilter, resetFilters } = usePromotionsStore();
  const { data, isLoading, isError } = usePromotions(filters);

  const selectedEvent = useMemo(() => {
    if (searchParams.get("target_type") !== "event") {
      return null;
    }

    const id = Number(searchParams.get("event_id"));
    const title = searchParams.get("event_name");

    if (!id || !title) {
      return null;
    }

    return {
      id,
      title,
      slug: searchParams.get("event_slug"),
      startsAt: searchParams.get("event_starts_at"),
      venue: searchParams.get("event_venue"),
      city: searchParams.get("event_city"),
    };
  }, [searchParams]);

  const promotionDetailSuffix = useMemo(() => {
    if (!selectedEvent) {
      return "";
    }

    const params = new URLSearchParams();
    params.set("target_type", "event");
    params.set("event_id", String(selectedEvent.id));
    params.set("event_name", selectedEvent.title);

    if (selectedEvent.slug) params.set("event_slug", selectedEvent.slug);
    if (selectedEvent.startsAt) params.set("event_starts_at", selectedEvent.startsAt);
    if (selectedEvent.venue) params.set("event_venue", selectedEvent.venue);
    if (selectedEvent.city) params.set("event_city", selectedEvent.city);

    return `?${params.toString()}`;
  }, [selectedEvent]);

  const promotions = data?.data ?? [];
  const meta = data?.meta;
  const activeFilterEntries = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) => {
        if (key === "page" || key === "per_page" || key === "sort") {
          return false;
        }

        if (typeof value === "boolean") {
          return value;
        }

        return value !== undefined && value !== null && value !== "";
      }),
    [filters]
  );
  const hasActiveFilters = activeFilterEntries.length > 0;

  const summary = useMemo(() => {
    const verifiedPromoters = new Set(
      promotions
        .filter((promotion) => promotion.promoter.is_verified)
        .map((promotion) => promotion.promoter.username)
    ).size;

    const avgReach =
      promotions.length > 0
        ? promotions.reduce((sum, promotion) => sum + promotion.estimated_reach, 0) / promotions.length
        : 0;

    const avgDelivery =
      promotions.length > 0
        ? promotions.reduce((sum, promotion) => sum + promotion.delivery_days_min, 0) / promotions.length
        : 0;

    const featured = promotions.filter((promotion) => promotion.is_featured);
    const topPromoters = Array.from(
      new Map(
        promotions.map((promotion) => [
          promotion.promoter.username,
          {
            username: promotion.promoter.username,
            name: promotion.promoter.name,
            verified: promotion.promoter.is_verified,
            followerCount: promotion.promoter.follower_count,
            platform: promotion.platform,
            offerCount: promotions.filter(
              (item) => item.promoter.username === promotion.promoter.username
            ).length,
          },
        ])
      ).values()
    ).slice(0, 3);

    return {
      verifiedPromoters,
      avgReach,
      avgDelivery,
      featured,
      topPromoters,
    };
  }, [promotions]);
  const recommendationLanes = useMemo(
    () => buildRecommendationLanes(promotions).slice(0, 4),
    [promotions]
  );

  const clearEventContext = () => {
    router.replace("/promotions");
  };

  const clearBrowseFilters = () => {
    resetFilters();
  };

  const setQuickFilter = (key: keyof typeof filters, value: string | boolean | undefined) => {
    setFilter(key as never, value as never);
  };
  const applyRecommendationLane = (lane: RecommendationLane) => {
    resetFilters();
    Object.entries(lane.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        setFilter(key as keyof typeof filters, value as never);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setFilter("page", page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <section className="rounded-3xl border bg-card">
          <div className="border-b px-6 py-6 md:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  <Megaphone className="h-3.5 w-3.5" />
                  Artist Promotion Marketplace
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Find a promoter who can push your song.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    Browse real promoter storefronts, compare service offers, and place an order for TikTok, radio, DJ, or creator promotion with proof and reviews handled through Tesotunes.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickFilter("platform", "tiktok")}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    Start with TikTok promoters
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFilter("platform", "radio")}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <Radio className="h-4 w-4 text-primary" />
                    Start with radio promoters
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFilter("verified", true)}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Only trusted storefronts
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[26rem]">
                <StatCard
                  label="Live Offers"
                  value={formatNumber(meta?.total ?? 0)}
                  note="Promotion packages artists can compare right now."
                />
                <StatCard
                  label="Trusted Promoters"
                  value={formatNumber(summary.verifiedPromoters)}
                  note="Verified storefronts in the current visible marketplace."
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:px-8 lg:grid-cols-4">
            <StatCard
              label="Average Reach"
              value={formatNumber(Math.round(summary.avgReach))}
              note="Estimated audience across the visible promotion offers."
            />
            <StatCard
              label="Fastest Turn"
              value={
                promotions.length > 0
                  ? `${Math.min(...promotions.map((promotion) => promotion.delivery_days_min))} days`
                  : "Flexible"
              }
              note="Useful when you need release-week momentum."
            />
            <StatCard
              label="Booking"
              value="UGX + Credits"
              note="Tesotunes handles checkout, proof, and disputes."
            />
            <StatCard
              label="Promoter Entry"
              value="Live"
              note="Promoters can publish offers, add proof, and manage orders."
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Step 1
            </p>
            <h2 className="mt-2 text-lg font-semibold">Open a promoter storefront</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by checking the promoter, their reviews, portfolio, and the channels they actually use.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Step 2
            </p>
            <h2 className="mt-2 text-lg font-semibold">Compare the actual offer</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Check the price, time frame, deliverables, proof style, and whether the promoter is offering TikTok, radio, club, or another lane.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Step 3
            </p>
            <h2 className="mt-2 text-lg font-semibold">Book and track in Tesotunes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Place the order, receive proof, confirm delivery, or dispute if the agreed promotion was not delivered.
            </p>
          </div>
        </section>

        {selectedEvent && (
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Event Promotion Context
                </p>
                <h2 className="text-lg font-semibold">{selectedEvent.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.venue || "Venue pending"}
                  {selectedEvent.city ? ` · ${selectedEvent.city}` : ""}
                  {selectedEvent.startsAt ? ` · ${selectedEvent.startsAt}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" />
                  Service detail pages will keep this event attached.
                </div>
                <button
                  type="button"
                  onClick={clearEventContext}
                  className="rounded-full border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Clear event mode
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <h2 className="mt-2 text-xl font-bold">Search and compare offers</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use filters when you already know the channel, audience fit, timing, or proof style you want.
              </p>
              <div className="mt-5">
                <PromotionFilters />
              </div>
              <button
                type="button"
                onClick={clearBrowseFilters}
                className="mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Reset filters
              </button>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Promoter Workspace
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                These tools are for promoters selling services, not for artists buying them.
              </p>
              <div className="mt-4 space-y-3">
                <Link
                  href="/artist/promotions"
                  className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Promotions dashboard</p>
                      <p className="text-sm text-muted-foreground">Manage listings and orders.</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/artist/promotions/create"
                  className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Create promotion offer</p>
                      <p className="text-sm text-muted-foreground">Publish a service package.</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/promotions/purchases"
                  className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Buyer order tracking</p>
                      <p className="text-sm text-muted-foreground">View purchased campaigns.</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {recommendationLanes.length > 0 && !hasActiveFilters && (
              <section className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Quick Starting Points
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      Start with the kind of promoter you need
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      These suggestions help artists like Richo move quickly from goal to a shortlist of promoters and offers.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {recommendationLanes.map((lane) => (
                    <button
                      key={lane.key}
                      type="button"
                      onClick={() => applyRecommendationLane(lane)}
                      className="rounded-2xl border p-4 text-left transition hover:bg-muted"
                    >
                      <p className="text-sm font-semibold">{lane.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{lane.note}</p>
                      <div className="mt-4 rounded-xl bg-muted/40 p-3">
                        <p className="text-sm font-medium">{lane.promotion.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {lane.promotion.promoter.name} · {labelFromSlug(lane.promotion.platform)}
                        </p>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        {lane.actionLabel}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Start With Promoters
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Browse trusted storefronts before you place an order
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  If you already know you want someone like Papa Ti, start here. Open the storefront, review proof and reviews, then compare the service offer that matches your song rollout.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {summary.topPromoters.length > 0 ? (
                    summary.topPromoters.map((promoter) => (
                      <Link
                        key={promoter.username}
                        href={`/promoters/${promoter.username}`}
                        className="rounded-2xl border p-4 transition hover:bg-muted"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold">{promoter.name}</p>
                              {promoter.verified && (
                                <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {labelFromSlug(promoter.platform)} promoter
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {formatNumber(promoter.followerCount)}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatNumber(promoter.offerCount)} live offers
                          </span>
                          <span className="font-medium text-primary">Open storefront</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground md:col-span-3">
                      Promoter storefronts will appear here as active listings load.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Marketplace Summary
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {formatNumber(meta?.total ?? 0)} service offers ready to book
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  After you shortlist a promoter, use the offer list below to compare price, timing, and delivery scope.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-muted/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-primary" />
                      Reach
                    </div>
                    <p className="mt-2 text-lg font-semibold">
                      {formatNumber(Math.round(summary.avgReach))}
                    </p>
                    <p className="text-sm text-muted-foreground">Average estimated audience</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock3 className="h-4 w-4 text-primary" />
                      Delivery
                    </div>
                    <p className="mt-2 text-lg font-semibold">
                      {summary.avgDelivery > 0 ? `${Math.round(summary.avgDelivery)} day avg` : "Flexible"}
                    </p>
                    <p className="text-sm text-muted-foreground">Typical minimum turnaround</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Coins className="h-4 w-4 text-primary" />
                      Price
                    </div>
                    <p className="mt-2 text-lg font-semibold">
                      {promotions.some((promotion) => promotion.accepts_ugx)
                        ? formatCurrency(
                            Math.min(
                              ...promotions
                                .filter((promotion) => promotion.accepts_ugx)
                                .map((promotion) => promotion.price_ugx)
                            )
                          )
                        : "Flexible"}
                    </p>
                    <p className="text-sm text-muted-foreground">Lowest visible UGX offer</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Why This Works
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-semibold">Promoters are review-backed</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Richo should be able to judge Papa Ti by storefront proof, portfolio, and order history before paying.
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-semibold">Offers make the promise explicit</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Each service should clearly say the channel, price, timeframe, and proof expectation.
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-semibold">Tesotunes handles the workflow</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Booking, proof submission, buyer confirmation, disputes, and settlement all stay inside one flow.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {summary.featured.length > 0 && (
              <section className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Featured Services
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">Compare standout offers</h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {summary.featured.slice(0, 3).map((promotion) => (
                    <Link
                      key={promotion.id}
                      href={`/promotions/${promotion.slug}${promotionDetailSuffix}`}
                      className="rounded-2xl border p-4 transition hover:bg-muted"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{promotion.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {promotion.promoter.name}
                          </p>
                        </div>
                        {promotion.promoter.is_verified && (
                          <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />
                        )}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {promotion.short_description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold text-primary">
                          {promotion.accepts_credits
                            ? `${formatNumber(promotion.price_credits)} credits`
                            : formatCurrency(promotion.price_ugx)}
                        </span>
                        <span className="text-muted-foreground">
                          {labelFromSlug(promotion.platform)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Service Offers
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">Browse active promotion offers</h2>
                  {meta && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Page {meta.current_page} of {meta.last_page} · {formatNumber(meta.total)} total offers
                    </p>
                  )}
                </div>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilterEntries.slice(0, 4).map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground"
                      >
                        {labelFromSlug(key)}: {String(value)}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={clearBrowseFilters}
                      className="rounded-full border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {isError ? (
                <div className="mt-6 space-y-4">
                  <PromotionsEmptyState
                    title="We couldn’t load promotion services"
                    description="Check that the local API is running, then refresh this page."
                  />
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Retry page
                    </button>
                    <Link
                      href="/artist/promotions"
                      className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Open seller dashboard
                    </Link>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <PromotionCardSkeleton key={index} />
                  ))}
                </div>
              ) : promotions.length === 0 ? (
                <div className="mt-6 space-y-4">
                  <PromotionsEmptyState
                    title="No promotion services match these filters"
                    description="Try changing platform, budget, or audience targeting to widen the result set."
                  />
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={clearBrowseFilters}
                      className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Reset browse filters
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickFilter("featured", true)}
                      className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Show featured only
                    </button>
                    <Link
                      href="/artist/promotions/create"
                      className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Become a seller
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {promotions.map((promotion: PromotionListItem) => (
                      <PromotionCard
                        key={promotion.id}
                        promotion={promotion}
                        href={`/promotions/${promotion.slug}${promotionDetailSuffix}`}
                      />
                    ))}
                  </div>

                  {meta && (
                    <PromotionsPagination
                      currentPage={meta.current_page}
                      lastPage={meta.last_page}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
