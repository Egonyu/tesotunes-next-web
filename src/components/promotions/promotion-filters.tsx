"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePromotionsStore } from "@/stores/promotions";
import type {
  PromotionType,
  PromotionPlatform,
  PromotionAudienceNiche,
  PromotionContentFormat,
} from "@/types/promotions";
import {
  PROMOTION_AUDIENCE_NICHE_LABELS,
  PROMOTION_CONTENT_FORMAT_LABELS,
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
  const { filters, setFilter, setFilters, resetFilters } =
    usePromotionsStore();

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
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
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

        <select
          value={filters.audience_niche || ""}
          onChange={(e) =>
            setFilter(
              "audience_niche",
              (e.target.value as PromotionAudienceNiche) || undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Any Audience</option>
          {Object.entries(PROMOTION_AUDIENCE_NICHE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.content_format || ""}
          onChange={(e) =>
            setFilter(
              "content_format",
              (e.target.value as PromotionContentFormat) || undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Any Format</option>
          {Object.entries(PROMOTION_CONTENT_FORMAT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.sort || "popularity"}
          onChange={(e) => setFilter("sort", e.target.value as typeof filters.sort)}
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

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

        <select
          value={filters.delivery_days_max || ""}
          onChange={(e) =>
            setFilter(
              "delivery_days_max",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Any Delivery Speed</option>
          <option value="2">2 days or less</option>
          <option value="3">3 days or less</option>
          <option value="5">5 days or less</option>
          <option value="7">7 days or less</option>
          <option value="14">14 days or less</option>
        </select>

        {/* Featured only */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none rounded-lg border px-3 py-2 bg-muted/30">
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

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none rounded-lg border px-3 py-2 bg-muted/30">
          <input
            type="checkbox"
            checked={!!filters.verified}
            onChange={(e) =>
              setFilter("verified", e.target.checked || undefined)
            }
            className="rounded border-muted-foreground/30 text-primary focus:ring-primary/20"
          />
          Verified Promoters
        </label>

        <input
          type="number"
          min={0}
          step={1000}
          placeholder="Min UGX"
          value={filters.min_price_ugx ?? ""}
          onChange={(e) =>
            setFilter(
              "min_price_ugx",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="text"
          placeholder="Audience region"
          value={filters.audience_region ?? ""}
          onChange={(e) =>
            setFilter(
              "audience_region",
              e.target.value || undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="text"
          placeholder="Channel or account"
          value={filters.channel ?? ""}
          onChange={(e) => setFilter("channel", e.target.value || undefined)}
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="text"
          placeholder="Placement style"
          value={filters.placement ?? ""}
          onChange={(e) => setFilter("placement", e.target.value || undefined)}
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="text"
          placeholder="Proof type"
          value={filters.proof_type ?? ""}
          onChange={(e) => setFilter("proof_type", e.target.value || undefined)}
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="text"
          placeholder="Timing window"
          value={filters.timing ?? ""}
          onChange={(e) => setFilter("timing", e.target.value || undefined)}
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

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
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="number"
          min={0}
          step={1}
          placeholder="Min reach"
          value={filters.min_reach ?? ""}
          onChange={(e) =>
            setFilter(
              "min_reach",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="number"
          min={0}
          step={1}
          placeholder="Max reach"
          value={filters.max_reach ?? ""}
          onChange={(e) =>
            setFilter(
              "max_reach",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="number"
          min={0}
          step={1}
          placeholder="Min credits"
          value={filters.min_price_credits ?? ""}
          onChange={(e) =>
            setFilter(
              "min_price_credits",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="number"
          min={0}
          step={1}
          placeholder="Max credits"
          value={filters.max_price_credits ?? ""}
          onChange={(e) =>
            setFilter(
              "max_price_credits",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="bg-muted/50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 md:col-span-2 xl:col-span-4 justify-start"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
