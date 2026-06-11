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
    router.replace("/promotions/browse");
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
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Promotion services</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse live offers, filter quickly, and open a service when you are ready to book.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/artist/promotions" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                Seller dashboard
              </Link>
              <Link href="/artist/promotions/create" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Create service
              </Link>
              <Link href="/promotions/purchases" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                My purchases
              </Link>
            </div>
          </div>

          {selectedEvent && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{selectedEvent.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.venue || "Venue pending"}
                  {selectedEvent.city ? ` · ${selectedEvent.city}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={clearEventContext}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                Clear event mode
              </button>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <PromotionFilters />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setQuickFilter("platform", "tiktok")} className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
                TikTok
              </button>
              <button type="button" onClick={() => setQuickFilter("platform", "radio")} className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
                Radio
              </button>
              <button type="button" onClick={() => setQuickFilter("platform", "club")} className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
                Club / DJ
              </button>
              <button type="button" onClick={() => setQuickFilter("verified", true)} className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
                Verified
              </button>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Live services</h2>
                  {meta && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Page {meta.current_page} of {meta.last_page} · {formatNumber(meta.total)} total offers
                    </p>
                  )}
                </div>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilterEntries.map(([key, value]) => (
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
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Retry page
                    </button>
                    <Link
                      href="/artist/promotions"
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
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
                    description="Try another platform, loosen the budget, or clear the filters."
                  />
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={clearBrowseFilters}
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Reset filters
                    </button>
                    <Link
                      href="/artist/promotions/create"
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
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
        </section>
      </div>
    </div>
  );
}
