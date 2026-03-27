"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Globe,
  Link2,
  Loader2,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { usePromoterProfile } from "@/hooks/usePromotions";
import { PromotionCard, PromotionsEmptyState } from "@/components/promotions";
import type { PromoterProfile } from "@/types/promotions";

const SOCIAL_LABELS: Array<{
  key: keyof PromoterProfile["social_links"];
  label: string;
}> = [
  { key: "instagram_url", label: "Instagram" },
  { key: "tiktok_url", label: "TikTok" },
  { key: "youtube_url", label: "YouTube" },
  { key: "facebook_url", label: "Facebook" },
  { key: "twitter_url", label: "X / Twitter" },
  { key: "website_url", label: "Website" },
];

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

  const socialLinks = SOCIAL_LABELS.flatMap(({ key, label }) => {
    const href = promoter.social_links?.[key];
    return href ? [{ href, label }] : [];
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/promotions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Promotions
      </Link>

      <section className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="absolute inset-0">
          {promoter.banner_url ? (
            <Image
              src={promoter.banner_url}
              alt={`${promoter.name} banner`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/30" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-3xl border bg-muted shrink-0">
                {promoter.avatar_url ? (
                  <Image
                    src={promoter.avatar_url}
                    alt={promoter.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                    {promoter.name.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{promoter.name}</h1>
                    {promoter.is_verified && (
                      <BadgeCheck className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{promoter.username}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {formatNumber(promoter.follower_count)} followers
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {promoter.average_rating.toFixed(1)} avg rating
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {promoter.location ?? "Location not shared"}
                  </span>
                </div>

                {promoter.bio ? (
                  <p className="max-w-2xl text-sm leading-6 text-foreground/85">
                    {promoter.bio}
                  </p>
                ) : (
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    This promoter has not shared a bio yet. Their active services below
                    are the best guide to what they offer.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[28rem]">
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Services
                </p>
                <p className="mt-1 text-2xl font-semibold">{promoter.total_promotions}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Active
                </p>
                <p className="mt-1 text-2xl font-semibold">{promoter.active_promotions}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Featured
                </p>
                <p className="mt-1 text-2xl font-semibold">{promoter.featured_promotions}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Completed
                </p>
                <p className="mt-1 text-2xl font-semibold">{promoter.completed_orders}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {promoter.platforms.map((platform) => (
              <span
                key={platform}
                className="rounded-full border bg-background/80 px-3 py-1 text-xs font-medium capitalize text-foreground/80"
              >
                {platform.replace("_", " ")}
              </span>
            ))}
            {promoter.service_types.map((type) => (
              <span
                key={type}
                className="rounded-full border bg-primary/5 px-3 py-1 text-xs font-medium capitalize text-primary"
              >
                {type.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border bg-background/90 px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
                >
                  {link.label === "Website" ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <Link2 className="h-3.5 w-3.5" />
                  )}
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Active Services</h2>
          <p className="text-sm text-muted-foreground">
            Browse the services this promoter is currently offering.
          </p>
        </div>

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
      </section>
    </div>
  );
}
