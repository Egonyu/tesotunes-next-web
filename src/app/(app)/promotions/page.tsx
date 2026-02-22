"use client";

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
  const { filters, setFilter } = usePromotionsStore();
  const { data, isLoading, isError } = usePromotions(filters);

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
              Discover promotional services from influencers, DJs, radio
              stations & more
            </p>
          </div>
        </div>
      </div>

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
              <PromotionCard key={promo.id} promotion={promo} />
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
