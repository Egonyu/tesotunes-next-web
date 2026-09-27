"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Users,
  Clock,
  TrendingUp,
  BadgeCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { PromotionListItem } from "@/types/promotions";
import {
  PROMOTION_AUDIENCE_NICHE_LABELS,
  PROMOTION_CONTENT_FORMAT_LABELS,
  PROMOTION_TYPE_LABELS,
  PROMOTION_PLATFORM_LABELS,
} from "@/types/promotions";

interface PromotionCardProps {
  promotion: PromotionListItem;
  className?: string;
  href?: string;
}

function labelFromSlug(value: string | null | undefined) {
  if (!value) return "Other";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PromotionCard({
  promotion,
  className,
  href,
}: PromotionCardProps) {
  const deliveryText =
    promotion.delivery_days_min === promotion.delivery_days_max
      ? `${promotion.delivery_days_min} day${promotion.delivery_days_min !== 1 ? "s" : ""}`
      : `${promotion.delivery_days_min}-${promotion.delivery_days_max} days`;

  return (
    <Link
      href={href || `/promotions/${promotion.slug}`}
      className={cn(
        "group grid min-w-0 grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-2xl border bg-card transition-all hover:border-primary/50 hover:shadow-lg sm:grid-cols-[180px_minmax(0,1fr)]",
        className
      )}
    >
      {/* Featured Image */}
      <div className="relative min-h-[172px] overflow-hidden bg-muted sm:min-h-[190px]">
        {promotion.featured_image_url ? (
          <Image
            src={promotion.featured_image_url}
            alt={promotion.title}
            fill
            sizes="(max-width: 640px) 104px, 180px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Zap className="h-10 w-10 text-primary/40" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
          {promotion.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Featured
            </span>
          )}
          {promotion.is_top_rated && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Top Rated
            </span>
          )}
        </div>

        {/* Platform badge */}
        <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)]">
          <span className="block truncate rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {PROMOTION_PLATFORM_LABELS[promotion.platform] ??
              labelFromSlug(promotion.platform)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
        {/* Type label */}
        <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
          {PROMOTION_TYPE_LABELS[promotion.type] ??
            labelFromSlug(promotion.type)}
        </span>

        {/* Title */}
        <h3 className="line-clamp-2 break-words text-sm font-semibold leading-tight transition-colors group-hover:text-primary sm:text-base">
          {promotion.title}
        </h3>

        {/* Short description */}
        <p className="line-clamp-2 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
          {promotion.short_description}
        </p>

        {(promotion.audience_niches?.length || promotion.content_formats?.length) && (
          <div className="hidden flex-wrap gap-1.5 sm:flex">
            {(promotion.audience_niches ?? []).slice(0, 2).map((niche) => (
              <span
                key={niche}
                className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
              >
                {PROMOTION_AUDIENCE_NICHE_LABELS[niche] ??
                  labelFromSlug(niche)}
              </span>
            ))}
            {(promotion.content_formats ?? []).slice(0, 1).map((format) => (
              <span
                key={format}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {PROMOTION_CONTENT_FORMAT_LABELS[format] ??
                  labelFromSlug(format)}
              </span>
            ))}
          </div>
        )}

        {/* Promoter */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative h-6 w-6 rounded-full overflow-hidden bg-muted shrink-0">
            {promotion.promoter.avatar_url ? (
              <Image
                src={promotion.promoter.avatar_url}
                alt={promotion.promoter.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {promotion.promoter.name[0]}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {promotion.promoter.name}
          </span>
          {promotion.promoter.is_verified && (
            <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground sm:flex sm:flex-wrap sm:gap-3 sm:text-xs">
          <span className="flex min-w-0 items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            {promotion.rating_average.toFixed(1)}
            <span className="text-muted-foreground/60">
              ({promotion.rating_count})
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(promotion.estimated_reach)}
          </span>
          <span className="col-span-2 flex min-w-0 items-center gap-1 sm:col-span-1">
            <Clock className="h-3.5 w-3.5" />
            {deliveryText}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto flex min-w-0 items-end justify-between gap-2 border-t pt-2">
          <div className="flex min-w-0 flex-col">
            {promotion.accepts_credits && (
              <span className="truncate text-sm font-bold text-primary">
                {formatNumber(promotion.price_credits)} credits
              </span>
            )}
            {promotion.accepts_ugx && (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(promotion.price_ugx)}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
            <TrendingUp className="h-3 w-3" />
            {promotion.completed_orders} sold
          </div>
        </div>
      </div>
    </Link>
  );
}
