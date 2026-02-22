"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePromotionsStore } from "@/stores/promotions";
import type { PromotionType, PromotionPlatform } from "@/types/promotions";
import {
  PROMOTION_TYPE_LABELS,
  PROMOTION_PLATFORM_LABELS,
} from "@/types/promotions";

const SORT_OPTIONS = [
  { value: "popularity", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export function PromotionFilters() {
  const { filters, setFilter, setFilters, resetFilters } =
    usePromotionsStore();

  const hasActiveFilters =
    filters.type ||
    filters.platform ||
    filters.min_price_credits ||
    filters.max_price_credits ||
    filters.rating_min ||
    filters.featured ||
    filters.search;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search promotions..."
          value={filters.search || ""}
          onChange={(e) => setFilter("search", e.target.value || undefined)}
          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Type */}
        <select
          value={filters.type || ""}
          onChange={(e) =>
            setFilter(
              "type",
              (e.target.value as PromotionType) || undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Types</option>
          {Object.entries(PROMOTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Platform */}
        <select
          value={filters.platform || ""}
          onChange={(e) =>
            setFilter(
              "platform",
              (e.target.value as PromotionPlatform) || undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Platforms</option>
          {Object.entries(PROMOTION_PLATFORM_LABELS).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>

        {/* Sort */}
        <select
          value={filters.sort || "popularity"}
          onChange={(e) =>
            setFilter(
              "sort",
              e.target.value as typeof filters.sort
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Min rating */}
        <select
          value={filters.rating_min || ""}
          onChange={(e) =>
            setFilter(
              "rating_min",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>

        {/* Featured only */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!filters.featured}
            onChange={(e) =>
              setFilter("featured", e.target.checked || undefined)
            }
            className="rounded border-muted-foreground/30 text-primary focus:ring-primary/20"
          />
          Featured Only
        </label>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 ml-auto"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
