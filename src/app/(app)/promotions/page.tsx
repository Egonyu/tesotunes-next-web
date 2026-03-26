"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Megaphone } from "lucide-react";
import { usePromotions } from "@/hooks/usePromotions";
import { usePromotionsStore } from "@/stores/promotions";
import {
  PromotionCard,
  PromotionFilters,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";

export default function PromotionsBrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilter } = usePromotionsStore();
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

    if (selectedEvent.slug) {
      params.set("event_slug", selectedEvent.slug);
    }

    if (selectedEvent.startsAt) {
      params.set("event_starts_at", selectedEvent.startsAt);
    }

    if (selectedEvent.venue) {
      params.set("event_venue", selectedEvent.venue);
    }

    if (selectedEvent.city) {
      params.set("event_city", selectedEvent.city);
    }

    return `?${params.toString()}`;
  }, [selectedEvent]);

  const clearEventContext = () => {
    router.replace("/promotions");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Promotions Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              {selectedEvent
                ? `Choose a promotion package for ${selectedEvent.title} and keep the event as the tracked campaign target.`
                : "Discover promotional services from influencers, DJs, radio stations & more"}
            </p>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Event Promotion Mode
              </p>
              <h2 className="text-lg font-semibold">{selectedEvent.title}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.venue || "Venue pending"}
                {selectedEvent.city ? ` · ${selectedEvent.city}` : ""}
                {selectedEvent.startsAt ? ` · ${selectedEvent.startsAt}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={clearEventContext}
              className="rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Browse all promotions
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <PromotionFilters />

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <PromotionsEmptyState
          title="Something went wrong"
          description="Failed to load promotions. Please try again later."
        />
      ) : !data?.data?.length ? (
        <PromotionsEmptyState />
      ) : (
        <>
          {/* Count */}
          <p className="text-sm text-muted-foreground">
            {data.meta.total} promotion{data.meta.total !== 1 ? "s" : ""} found
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.data.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                href={`/promotions/${promo.slug}${promotionDetailSuffix}`}
              />
            ))}
          </div>

          {/* Pagination */}
          <PromotionsPagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            onPageChange={(page) => setFilter("page", page)}
          />
        </>
      )}
    </div>
  );
}
