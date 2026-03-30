"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Radio,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { useAdminAnalytics, useAdminPromotions } from "@/hooks/usePromotions";
import { formatNumber } from "@/lib/utils";

export default function CreatePromotionPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: promotions, isLoading: promotionsLoading } = useAdminPromotions({
    status: "active",
    page: 1,
  });

  const liveListings = promotions?.data ?? [];
  const isLoading = analyticsLoading || promotionsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/store/promotions"
          className="rounded-lg p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Promotion Creation Flow</h1>
          <p className="text-muted-foreground">
            Admin store promotion creation has been reconciled into the live promotions marketplace.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Ownership Update
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          Marketplace listings are created by promoters and sellers, not from a separate admin store form.
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          The old admin create page was wired to retired `/admin/store/promotions`
          endpoints. To avoid duplicate systems, admin now moderates and analyzes
          the same promotion listings that sellers create in their studio and that
          buyers browse on `/promotions`.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/promotions"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open admin moderation
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/promotions/analytics"
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-medium hover:bg-muted"
          >
            View analytics
          </Link>
          <Link
            href="/artist/promotions/create"
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-medium hover:bg-muted"
          >
            Open seller create flow
          </Link>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Megaphone className="h-4 w-4 text-primary" />
                <span className="text-sm">Live Listings</span>
              </div>
              <p className="text-2xl font-bold">
                {formatNumber(analytics?.total_promotions ?? 0)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Canonical promotions currently available to moderate.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">Orders</span>
              </div>
              <p className="text-2xl font-bold">
                {formatNumber(analytics?.total_orders ?? 0)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Promotion orders flowing through the shared marketplace.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm">Active</span>
              </div>
              <p className="text-2xl font-bold">
                {formatNumber(analytics?.active_promotions ?? 0)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Currently bookable services in the public marketplace.
              </p>
            </div>
          </div>

          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">How this now works</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <p className="font-medium">Seller-owned creation</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Influencers, DJs, radios, and artists create listings in the seller studio.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  <p className="font-medium">Buyer-facing discovery</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Artists browse, purchase, review, and dispute through the live `/promotions` marketplace.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  <p className="font-medium">Admin moderation</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Admin approves, rejects, analyzes, and resolves disputes from the canonical admin screens.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Moderation handoff checklist</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <p className="font-medium">Media & identity</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check whether the listing has a cover image, clear title, and a storefront identity that matches the seller.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  <p className="font-medium">Channel proof</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Radio and DJ offers should explain airtime, set context, proof of play, or delivery evidence before approval.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <p className="font-medium">Buyer clarity</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Audience targeting, content format, and pricing should be specific enough for artists to self-qualify.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Recent live listings</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quick visibility into the actual services currently running through the marketplace.
                </p>
              </div>
              <Link
                href="/admin/store/promotions"
                className="text-sm font-medium text-primary hover:underline"
              >
                View full list
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {liveListings.slice(0, 6).map((promotion) => (
                <div key={promotion.id} className="rounded-2xl border bg-background/70 p-4">
                  <p className="font-semibold">{promotion.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {promotion.short_description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{promotion.promoter.name}</span>
                    <span className="font-medium text-primary">
                      {formatNumber(promotion.price_credits)} cr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
