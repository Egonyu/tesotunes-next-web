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
  PROMOTION_TYPE_LABELS,
  PROMOTION_PLATFORM_LABELS,
} from "@/types/promotions";

interface PromotionCardProps {
  promotion: PromotionListItem;
  className?: string;
  href?: string;
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
        "group block bg-card rounded-xl border hover:border-primary/50 transition-all hover:shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Featured Image */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {promotion.featured_image_url ? (
          <Image
            src={promotion.featured_image_url}
            alt={promotion.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Zap className="h-10 w-10 text-primary/40" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
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
        <div className="absolute top-2 right-2">
          <span className="bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            {PROMOTION_PLATFORM_LABELS[promotion.platform]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Type label */}
        <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
          {PROMOTION_TYPE_LABELS[promotion.type]}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {promotion.title}
        </h3>

        {/* Short description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {promotion.short_description}
        </p>

        {/* Promoter */}
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            {promotion.rating_average.toFixed(1)}
            <span className="text-muted-foreground/60">
              ({promotion.rating_count})
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(promotion.estimated_reach)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {deliveryText}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex flex-col">
            {promotion.accepts_credits && (
              <span className="text-sm font-bold text-primary">
                {formatNumber(promotion.price_credits)} credits
              </span>
            )}
            {promotion.accepts_ugx && (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(promotion.price_ugx)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {promotion.completed_orders} sold
          </div>
        </div>
      </div>
    </Link>
  );
}
