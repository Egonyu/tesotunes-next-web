"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Loader2,
  Megaphone,
  BarChart3,
  Users,
  CreditCard,
  Star,
  TrendingUp,
  ArrowRight,
  PauseCircle,
  Eye,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency } from "@/lib/utils";
import {
  useMyPromotions,
  usePausePromotion,
  useActivatePromotion,
  useDeletePromotion,
  useSellerAnalytics,
} from "@/hooks/usePromotions";
import {
  PromotionStatusBadge,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import { PROMOTION_PLATFORM_LABELS, PROMOTION_TYPE_LABELS } from "@/types/promotions";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" },
];

export default function ArtistPromotionsPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyPromotions({
    status: status || undefined,
    page,
  });
  const { data: analytics } = useSellerAnalytics();

  const pause = usePausePromotion();
  const activate = useActivatePromotion();
  const remove = useDeletePromotion();

  const getTypeLabel = (value: string) =>
    PROMOTION_TYPE_LABELS[value as keyof typeof PROMOTION_TYPE_LABELS] ??
    value.replace(/_/g, " ");

  const getPlatformLabel = (value: string) =>
    PROMOTION_PLATFORM_LABELS[value as keyof typeof PROMOTION_PLATFORM_LABELS] ??
    value.replace(/_/g, " ");

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Promotion management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create services, update live listings, and manage booking status from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/artist/promotions/profile"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Promoter profile
            </Link>
            <Link
              href="/artist/promotions/orders"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Order queue
            </Link>
            <Link
              href="/artist/promotions/create"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create service
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Megaphone className="h-3.5 w-3.5" />
              Active
            </div>
            <p className="text-2xl font-bold">{analytics.active_promotions}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3.5 w-3.5" />
              Total Orders
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(analytics.total_orders)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CreditCard className="h-3.5 w-3.5" />
              Revenue
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(analytics.total_revenue_credits)}
              <span className="text-xs text-muted-foreground ml-1">cr</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.total_revenue_ugx)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Net Revenue
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(analytics.net_revenue_credits)}
              <span className="text-xs text-muted-foreground ml-1">cr</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.net_revenue_ugx)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CreditCard className="h-3.5 w-3.5" />
              Platform Fees
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(analytics.total_platform_fees_credits)}
              <span className="text-xs text-muted-foreground ml-1">cr</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.total_platform_fees_ugx)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <BarChart3 className="h-3.5 w-3.5" />
              Settled
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(analytics.settled_orders)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Star className="h-3.5 w-3.5" />
              Rating
            </div>
            <p className="text-2xl font-bold">
              {analytics.average_rating.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.95fr)]">
        <section className="rounded-[28px] border border-border/60 bg-card/90 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your live services</h2>
              <p className="text-sm text-muted-foreground">
                Filter listings by status and manage what artists can currently book.
              </p>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    status === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !data?.data?.length ? (
            <PromotionsEmptyState
              title="No promotions yet"
              description="Create your first promotion to start earning from your influence."
            />
          ) : (
            <>
              <div className="mt-6 grid gap-4">
                {data.data.map((promo) => (
                  <article
                    key={promo.id}
                    className="rounded-[24px] border border-border/60 bg-background/70 p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <PromotionStatusBadge status={promo.status} />
                          <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                            {getTypeLabel(promo.type)}
                          </span>
                          <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                            {getPlatformLabel(promo.platform)}
                          </span>
                        </div>

                        <div className="mt-4">
                          <h3 className="text-xl font-semibold">{promo.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            {promo.short_description}
                          </p>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Pricing</p>
                            <p className="mt-2 font-semibold">{promo.price_credits} cr</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(promo.price_ugx)}</p>
                          </div>
                          <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Orders</p>
                            <p className="mt-2 font-semibold">{promo.completed_orders}/{promo.total_orders}</p>
                            <p className="text-xs text-muted-foreground">Completed vs total</p>
                          </div>
                          <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Reach</p>
                            <p className="mt-2 font-semibold">{formatNumber(promo.estimated_reach)}</p>
                            <p className="text-xs text-muted-foreground">Estimated audience</p>
                          </div>
                          <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Rating</p>
                            <p className="mt-2 font-semibold">{promo.rating_average.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">{promo.rating_count} reviews</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 xl:w-52">
                        <button
                          onClick={() => router.push(`/artist/promotions/${promo.id}/edit`)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                        >
                          Edit service
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        {promo.status === "active" && (
                          <button
                            onClick={() => pause.mutate(promo.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-500/20 dark:text-amber-300"
                          >
                            <PauseCircle className="h-4 w-4" />
                            Pause listing
                          </button>
                        )}
                        {promo.status === "paused" && (
                          <button
                            onClick={() => activate.mutate(promo.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300"
                          >
                            <ArrowRight className="h-4 w-4" />
                            Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (
                              confirm("Are you sure you want to delete this promotion?")
                            ) {
                              remove.mutate(promo.id);
                            }
                          }}
                          className="rounded-xl border border-destructive/20 px-4 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                        >
                          Delete listing
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <PromotionsPagination
                currentPage={data.meta.current_page}
                lastPage={data.meta.last_page}
                onPageChange={setPage}
              />
            </>
          )}
        </section>

        <aside className="rounded-[28px] border border-border/60 bg-card/90 p-6">
          <h2 className="text-lg font-semibold">What sells best here</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Artists respond best to clear scope, proof of reach, and platform-specific outcomes.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Short-form creators</p>
                <Megaphone className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Lead with follower quality, niche fit, and exactly what the artist receives.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Radio and DJ offers</p>
                <Radio className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Make slots, number of spins, and proof submission terms very explicit.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Profile quality</p>
                <Star className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Add highlights, social links, and performance proof on your promoter profile to increase conversion.
              </p>
              <Link
                href="/artist/promotions/profile"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Improve profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
