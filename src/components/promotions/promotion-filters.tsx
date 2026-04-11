"use client";

import { Search, X } from "lucide-react";
import { usePromotionsStore } from "@/stores/promotions";
import type {
  PromotionType,
  PromotionPlatform,
} from "@/types/promotions";
import {
  PROMOTION_TYPE_LABELS,
  PROMOTION_PLATFORM_LABELS,
} from "@/types/promotions";

const SORT_OPTIONS = [
  { value: "best_match", label: "Best Match" },
  { value: "popularity", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export function PromotionFilters() {
  const { filters, setFilter, resetFilters } = usePromotionsStore();

  const hasActiveFilters =
    filters.type ||
    filters.platform ||
    filters.audience_niche ||
    filters.audience_region ||
    filters.content_format ||
    filters.channel ||
    filters.placement ||
    filters.proof_type ||
    filters.timing ||
    filters.min_price_credits ||
    filters.max_price_credits ||
    filters.min_price_ugx ||
    filters.max_price_ugx ||
    filters.min_reach ||
    filters.max_reach ||
    filters.delivery_days_max ||
    filters.rating_min ||
    filters.featured ||
    filters.verified ||
    filters.search;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search services or promoter names"
          value={filters.search || ""}
          onChange={(e) => setFilter("search", e.target.value || undefined)}
          className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <select
          value={filters.type || ""}
          onChange={(e) =>
            setFilter(
              "type",
              (e.target.value as PromotionType) || undefined
            )
          }
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All services</option>
          {Object.entries(PROMOTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.platform || ""}
          onChange={(e) =>
            setFilter(
              "platform",
              (e.target.value as PromotionPlatform) || undefined
            )
          }
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All platforms</option>
          {Object.entries(PROMOTION_PLATFORM_LABELS).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>

        <select
          value={filters.delivery_days_max || ""}
          onChange={(e) =>
            setFilter(
              "delivery_days_max",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Any delivery speed</option>
          <option value="2">2 days or less</option>
          <option value="3">3 days or less</option>
          <option value="5">5 days or less</option>
          <option value="7">7 days or less</option>
          <option value="14">14 days or less</option>
        </select>

        <input
          type="number"
          min={0}
          step={1000}
          placeholder="Max UGX"
          value={filters.max_price_ugx ?? ""}
          onChange={(e) =>
            setFilter(
              "max_price_ugx",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <select
          value={filters.sort || "popularity"}
          onChange={(e) => setFilter("sort", e.target.value as typeof filters.sort)}
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={!!filters.verified}
            onChange={(e) =>
              setFilter("verified", e.target.checked || undefined)
            }
            className="rounded border-muted-foreground/30 text-primary focus:ring-primary/20"
          />
          Verified only
        </label>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 xl:justify-self-start"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
