"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  CreditCard,
  Eye,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Radio,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import {
  useAdminAnalytics,
  useAdminApprovePromotion,
  useAdminPromotions,
  useAdminRejectPromotion,
} from "@/hooks/usePromotions";
import {
  PromotionStatusBadge,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import {
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
} from "@/types/promotions";
import type { PromotionListItem, PromotionPlatform } from "@/types/promotions";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending Approval" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "rejected", label: "Rejected" },
];

const PLATFORM_REVIEW_NOTES: Partial<Record<PromotionPlatform, string>> = {
  tiktok:
    "Check that the promise is trend-safe, measurable, and clear about creator output.",
  instagram:
    "Look for clear scope across reels, posts, or stories so artists know what is included.",
  radio:
    "Confirm the offer explains airtime context, spin expectations, and proof of airplay.",
  club:
    "DJ and venue offers should clearly describe set context, timing, and proof of play.",
  youtube:
    "Make sure long-form or reaction offers are specific about format and placement.",
  podcast:
    "Interview or feature offers should explain episode placement and expected audience fit.",
};

function moderationReadiness(promotion: PromotionListItem) {
  const checks = [
    promotion.short_description?.trim(),
    promotion.featured_image_url,
    promotion.estimated_reach > 0,
    promotion.audience_niches?.length,
    promotion.audience_regions?.length,
    promotion.content_formats?.length,
    promotion.promoter.is_verified,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function paymentModes(promotion: PromotionListItem) {
  return [
    promotion.accepts_credits ? "Credits" : null,
    promotion.accepts_ugx ? "UGX Wallet" : null,
    promotion.accepts_hybrid ? "Hybrid" : null,
  ].filter(Boolean) as string[];
}

function reviewFlags(promotion: PromotionListItem) {
  const flags: string[] = [];

  if (!promotion.featured_image_url) {
    flags.push("Missing cover media");
  }
  if (!promotion.audience_niches?.length) {
    flags.push("No niche targeting");
  }
  if (!promotion.content_formats?.length) {
    flags.push("No format targeting");
  }
  if (promotion.platform === "radio") {
    flags.push("Needs airtime proof clarity");
  }
  if (promotion.platform === "club") {
    flags.push("Needs set or venue clarity");
  }

  return flags.slice(0, 3);
}

export default function AdminPromotionsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError } = useAdminPromotions({
    status: status || undefined,
    page,
    search: search || undefined,
  });
  const { data: analytics } = useAdminAnalytics();

  const approve = useAdminApprovePromotion();
  const reject = useAdminRejectPromotion();

  const getTypeLabel = (value: string) =>
    PROMOTION_TYPE_LABELS[value as keyof typeof PROMOTION_TYPE_LABELS] ??
    value.replace(/_/g, " ");

  const getPlatformLabel = (value: string) =>
    PROMOTION_PLATFORM_LABELS[value as keyof typeof PROMOTION_PLATFORM_LABELS] ??
    value.replace(/_/g, " ");

  const visiblePromotions = data?.data ?? [];

  const summary = useMemo(() => {
    const verifiedPromoters = new Set(
      visiblePromotions
        .filter((promotion) => promotion.promoter.is_verified)
        .map((promotion) => promotion.promoter.username)
    ).size;

    return {
      verifiedPromoters,
      activeOnPage: visiblePromotions.filter((promotion) => promotion.status === "active").length,
      pendingOnPage: visiblePromotions.filter((promotion) => promotion.status === "pending").length,
      withMedia: visiblePromotions.filter((promotion) => Boolean(promotion.featured_image_url)).length,
    };
  }, [visiblePromotions]);

  const handleReject = (id: number) => {
    reject.mutate(
      { id, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectingId(null);
          setRejectReason("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-primary/20 bg-primary/5 p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Megaphone className="h-3.5 w-3.5" />
              Promotions Marketplace Admin
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Moderate live promotion listings from one canonical queue
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              This admin surface now governs the same seller-created marketplace used by
              `/promotions`, seller studios, buyer purchases, disputes, and analytics.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[34rem]">
            <Link
              href="/admin/promotions/analytics"
              className="rounded-2xl border bg-background px-4 py-4 transition hover:bg-muted"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">Analytics</p>
              <p className="mt-1 text-xs text-muted-foreground">Platform GMV and performance</p>
            </Link>
            <Link
              href="/admin/promotions/disputes"
              className="rounded-2xl border bg-background px-4 py-4 transition hover:bg-muted"
            >
              <AlertTriangle className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">Disputes</p>
              <p className="mt-1 text-xs text-muted-foreground">Resolve buyer and seller conflicts</p>
            </Link>
            <Link
              href="/promotions"
              className="rounded-2xl border bg-background px-4 py-4 transition hover:bg-muted"
            >
              <Eye className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">Public View</p>
              <p className="mt-1 text-xs text-muted-foreground">See the live marketplace browse page</p>
            </Link>
          </div>
        </div>
      </section>

      {analytics && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Megaphone className="h-3.5 w-3.5" />
              Total Listings
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.total_promotions)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5" />
              Pending
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.pending_promotions ?? 0)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Orders
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.total_orders)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              GMV
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.total_gmv_credits)} cr</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(analytics.total_gmv_ugx)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Dispute Rate
            </div>
            <p className="text-2xl font-bold">{(analytics.dispute_rate * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      <section className="rounded-[28px] border bg-card p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Moderation Queue</h2>
                <p className="text-sm text-muted-foreground">
                  Search by listing or promoter, then approve or reject submissions from the same canonical marketplace.
                </p>
              </div>
              <div className="relative max-w-xl flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search promotions by title or promoter..."
                  className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
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
                    "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    status === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <PromotionsEmptyState
                title="Couldn’t load moderation data"
                description="Check the local backend connection, then refresh the queue."
              />
            ) : visiblePromotions.length === 0 ? (
              <PromotionsEmptyState
                title="No promotion listings found"
                description="No marketplace listings match the current queue filters."
              />
            ) : (
              <>
                <div className="grid gap-4">
                  {visiblePromotions.map((promo) => (
                    <article
                      key={promo.id}
                      className="rounded-[24px] border bg-background/70 p-5"
                    >
                      <div className="mb-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="overflow-hidden rounded-[22px] border bg-card">
                          {promo.featured_image_url ? (
                            <div
                              className="h-40 w-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${promo.featured_image_url})` }}
                            />
                          ) : (
                            <div className="flex h-40 items-center justify-center bg-muted/50 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2 text-center">
                                <ImageIcon className="h-8 w-8" />
                                <p className="text-xs">No listing cover uploaded</p>
                              </div>
                            </div>
                          )}
                          <div className="border-t bg-card p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                              Moderation readiness
                            </p>
                            <div className="mt-2 flex items-end justify-between gap-3">
                              <p className="text-2xl font-semibold">
                                {moderationReadiness(promo)}%
                              </p>
                              <span className="text-xs text-muted-foreground">
                                seller-provided context
                              </span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${moderationReadiness(promo)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <PromotionStatusBadge status={promo.status} />
                            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                              {getTypeLabel(promo.type)}
                            </span>
                            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                              {getPlatformLabel(promo.platform)}
                            </span>
                            {promo.promoter.is_verified && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Verified promoter
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            <h3 className="text-xl font-semibold">{promo.title}</h3>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                              {promo.short_description}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {paymentModes(promo).map((mode) => (
                              <span
                                key={mode}
                                className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground/80"
                              >
                                {mode}
                              </span>
                            ))}
                            {(promo.audience_niches ?? []).slice(0, 3).map((niche) => (
                              <span
                                key={niche}
                                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                              >
                                {niche.replace(/_/g, " ")}
                              </span>
                            ))}
                            {(promo.content_formats ?? []).slice(0, 2).map((format) => (
                              <span
                                key={format}
                                className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                              >
                                {format.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border bg-card px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Promoter</p>
                              <p className="mt-2 font-semibold">{promo.promoter.name}</p>
                              <p className="text-xs text-muted-foreground">@{promo.promoter.username}</p>
                            </div>
                            <div className="rounded-2xl border bg-card px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Commercials</p>
                              <p className="mt-2 font-semibold">{formatNumber(promo.price_credits)} cr</p>
                              <p className="text-xs text-muted-foreground">{formatCurrency(promo.price_ugx)}</p>
                            </div>
                            <div className="rounded-2xl border bg-card px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Orders</p>
                              <p className="mt-2 font-semibold">{promo.completed_orders}/{promo.total_orders}</p>
                              <p className="text-xs text-muted-foreground">Completed vs total</p>
                            </div>
                            <div className="rounded-2xl border bg-card px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Submitted</p>
                              <p className="mt-2 font-semibold">{formatDate(promo.created_at)}</p>
                              <p className="text-xs text-muted-foreground">Marketplace intake time</p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            <div className="rounded-2xl border bg-card p-4">
                              <div className="flex items-center gap-2">
                                <Radio className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">Channel review note</p>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {PLATFORM_REVIEW_NOTES[promo.platform] ??
                                  "Confirm the listing promise is measurable, commercially clear, and appropriate for the channel."}
                              </p>
                            </div>
                            <div className="rounded-2xl border bg-card p-4">
                              <p className="text-sm font-medium">Review flags</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {reviewFlags(promo).length ? (
                                  reviewFlags(promo).map((flag) => (
                                    <span
                                      key={flag}
                                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                                    >
                                      {flag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                    Strong listing metadata
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 xl:w-56">
                          <Link
                            href={`/promotions/${promo.slug}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted"
                          >
                            <Eye className="h-4 w-4" />
                            View listing
                          </Link>
                          {promo.status === "pending" ? (
                            <>
                              <button
                                onClick={() => approve.mutate(promo.id)}
                                disabled={approve.isPending}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingId(promo.id);
                                  setRejectReason("");
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <Link
                              href="/admin/promotions/disputes"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted"
                            >
                              Open disputes
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                        </div>
                      </div>

                      {rejectingId === promo.id && (
                        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                          <p className="text-sm font-medium">Rejection reason</p>
                          <textarea
                            value={rejectReason}
                            onChange={(event) => setRejectReason(event.target.value)}
                            placeholder="Explain why this listing is being rejected..."
                            rows={3}
                            className="mt-3 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                          />
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleReject(promo.id)}
                              disabled={!rejectReason || reject.isPending}
                              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
                            >
                              Confirm rejection
                            </button>
                            <button
                              onClick={() => setRejectingId(null)}
                              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                <PromotionsPagination
                  currentPage={data?.meta.current_page ?? 1}
                  lastPage={data?.meta.last_page ?? 1}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>

          <aside className="rounded-[24px] border bg-background/70 p-5">
            <h2 className="text-lg font-semibold">Queue Snapshot</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quick read on the currently visible moderation set.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">On this page</p>
                <p className="mt-2 text-2xl font-bold">{formatNumber(visiblePromotions.length)}</p>
                <p className="text-sm text-muted-foreground">Listings in the current queue view.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Pending here</p>
                <p className="mt-2 text-2xl font-bold">{formatNumber(summary.pendingOnPage)}</p>
                <p className="text-sm text-muted-foreground">Submissions needing moderation in this result set.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Verified promoters</p>
                <p className="mt-2 text-2xl font-bold">{formatNumber(summary.verifiedPromoters)}</p>
                <p className="text-sm text-muted-foreground">Verified storefront owners represented here.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">With cover media</p>
                <p className="mt-2 text-2xl font-bold">{formatNumber(summary.withMedia)}</p>
                <p className="text-sm text-muted-foreground">Listings in this queue view that include visual media.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Admin review focus</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>Check cover media and commercial clarity first.</p>
                  <p>Radio and DJ offers should explain proof and context.</p>
                  <p>Targeting should match the buyer audience promise.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
