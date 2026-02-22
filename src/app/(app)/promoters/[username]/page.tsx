"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Star, Users, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { usePromoterProfile } from "@/hooks/usePromotions";
import { PromotionCard, PromotionsEmptyState } from "@/components/promotions";

export default function PromoterProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { data: promoter, isLoading, isError } = usePromoterProfile(username);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !promoter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Promoter Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This profile doesn&apos;t exist or has been removed.
        </p>
        <Link href="/promotions" className="text-primary underline text-sm">
          Browse promotions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/promotions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Promotions
      </Link>

      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted shrink-0">
          {promoter.avatar_url ? (
            <Image
              src={promoter.avatar_url}
              alt={promoter.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {promoter.name[0]}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{promoter.name}</h1>
            {promoter.is_verified && (
              <BadgeCheck className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{promoter.username}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {formatNumber(promoter.follower_count)} followers
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              {promoter.average_rating.toFixed(1)} avg rating
            </span>
            <span>
              {promoter.completed_orders} orders completed
            </span>
          </div>
        </div>
      </div>

      {/* Promotions grid */}
      <div>
        <h2 className="font-semibold text-lg mb-4">
          Active Promotions ({promoter.total_promotions})
        </h2>
        {promoter.promotions.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {promoter.promotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        ) : (
          <PromotionsEmptyState
            title="No active promotions"
            description="This promoter doesn't have any active listings right now."
          />
        )}
      </div>
    </div>
  );
}
