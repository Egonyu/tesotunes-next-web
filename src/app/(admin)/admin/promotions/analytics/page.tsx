"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CreditCard,
  Loader2,
  Megaphone,
  Radio,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  useAdminAnalytics,
  useAdminDisputes,
  useAdminPromotions,
} from "@/hooks/usePromotions";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
} from "@/types/promotions";

type TopPromoterRow = {
  id: number;
  name: string;
  active_promotions?: number;
  total_orders?: number;
  total_revenue_credits?: number;
  avg_rating?: number | null;
};

function StatCard({
  icon,
  label,
  value,
  note,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className={`mb-1 flex items-center gap-2 text-xs ${color ?? "text-primary"}`}>
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

export default function AdminPromotionsAnalyticsPage() {
  const { data: analytics, isLoading } = useAdminAnalytics();
  const { data: listings } = useAdminPromotions({ page: 1 });
  const { data: openDisputes } = useAdminDisputes({ status: "open", page: 1 });
  const { data: resolvedDisputes } = useAdminDisputes({ status: "resolved", page: 1 });

  const listingData = listings?.data ?? [];
  const openCases = openDisputes?.data ?? [];
  const resolvedCases = resolvedDisputes?.data ?? [];
  const analyticsSnapshot = analytics ?? {
    total_promotions: 0,
    active_promotions: 0,
    total_orders: 0,
    total_gmv_credits: 0,
    total_gmv_ugx: 0,
    platform_revenue_ugx: 0,
    top_promoters: [],
    top_promotion_types: [],
    refund_rate: 0,
    repeat_buyer_rate: 0,
    avg_proof_submission_hours: null,
    avg_dispute_resolution_hours: null,
    average_order_value: 0,
    dispute_rate: 0,
  };

  const derived = useMemo(() => {
    const platformMix =
      analyticsSnapshot.platform_breakdown?.length
        ? analyticsSnapshot.platform_breakdown
        : Object.entries(
            listingData.reduce<Record<string, number>>((acc, item) => {
              acc[item.platform] = (acc[item.platform] ?? 0) + 1;
              return acc;
            }, {})
          )
            .map(([platform, count]) => ({
              platform,
              count,
              orders: 0,
              completed_orders: 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

    const disputePlatformMix =
      analyticsSnapshot.dispute_platform_breakdown?.length
        ? analyticsSnapshot.dispute_platform_breakdown
        : Object.entries(
            openCases.reduce<Record<string, number>>((acc, item) => {
              const key = item.promotion?.platform ?? "other";
              acc[key] = (acc[key] ?? 0) + 1;
              return acc;
            }, {})
          )
            .map(([platform, count]) => ({
              platform,
              count,
            }))
            .sort((a, b) => b.count - a.count);

    const proofCoveragePct =
      analyticsSnapshot.proof_coverage_pct ??
      (listingData.length
        ? Math.round(
            (listingData.filter((item) => Boolean(item.featured_image_url)).length /
              listingData.length) *
              100
          )
        : 0);

    const targetingCoveragePct =
      analyticsSnapshot.targeting_coverage_pct ??
      (listingData.length
        ? Math.round(
            (listingData.filter(
              (item) =>
                Boolean(item.audience_niches?.length) &&
                Boolean(item.content_formats?.length)
            ).length /
              listingData.length) *
              100
          )
        : 0);

    const highestRiskPlatform = disputePlatformMix[0] ?? null;

    return {
      platformMix,
      disputePlatformMix,
      proofCoveragePct,
      targetingCoveragePct,
      highestRiskPlatform,
      disputeLoad: openCases.length,
      resolvedLoad: resolvedCases.length,
    };
  }, [analyticsSnapshot, listingData, openCases, resolvedCases]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/promotions"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-background transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <BarChart3 className="h-5 w-5 text-primary" />
              Promotions Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Marketplace performance, moderation quality, and dispute risk in one view.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<Megaphone className="h-4 w-4" />}
          label="Total promotions"
          value={formatNumber(analyticsSnapshot.total_promotions)}
          note="All canonical marketplace listings"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Active promotions"
          value={formatNumber(analyticsSnapshot.active_promotions)}
          note="Currently bookable offers"
          color="text-emerald-500"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total orders"
          value={formatNumber(analyticsSnapshot.total_orders)}
          note="Promotion orders across the marketplace"
          color="text-blue-500"
        />
        <StatCard
          icon={<CreditCard className="h-4 w-4" />}
          label="GMV"
          value={`${formatNumber(analyticsSnapshot.total_gmv_credits)} cr`}
          note={formatCurrency(analyticsSnapshot.total_gmv_ugx)}
          color="text-amber-500"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Dispute rate"
          value={`${(analyticsSnapshot.dispute_rate * 100).toFixed(1)}%`}
          note="Marketplace-wide dispute incidence"
          color={
            analyticsSnapshot.dispute_rate > 0.05
              ? "text-red-500"
              : "text-emerald-500"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[28px] border bg-card p-6">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Current marketplace signals</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <StatCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Listings with media"
                value={`${derived.proofCoveragePct}%`}
                note="Cover-media coverage in the current admin listing set"
              />
              <StatCard
                icon={<ShieldAlert className="h-4 w-4" />}
                label="Targeting coverage"
                value={`${derived.targetingCoveragePct}%`}
                note="Listings with both niche and format targeting"
              />
              <StatCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Open disputes"
                value={formatNumber(derived.disputeLoad)}
                note={`${formatNumber(derived.resolvedLoad)} resolved cases in current review set`}
              />
            </div>
          </section>

          <section className="rounded-[28px] border bg-card p-6">
            <h2 className="text-lg font-semibold">Settlement operations</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Refund rate"
                value={`${((analyticsSnapshot.refund_rate ?? 0) * 100).toFixed(1)}%`}
                note="Orders that ended refunded"
                color={
                  (analyticsSnapshot.refund_rate ?? 0) > 0.08
                    ? "text-red-500"
                    : "text-emerald-500"
                }
              />
              <StatCard
                icon={<Users className="h-4 w-4" />}
                label="Repeat buyers"
                value={`${((analyticsSnapshot.repeat_buyer_rate ?? 0) * 100).toFixed(1)}%`}
                note="Orders from buyers with repeat marketplace activity"
                color="text-blue-500"
              />
              <StatCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Proof lag"
                value={
                  analyticsSnapshot.avg_proof_submission_hours != null
                    ? `${formatNumber(Math.round(analyticsSnapshot.avg_proof_submission_hours))}h`
                    : "—"
                }
                note="Average time from purchase to proof submission"
                color="text-amber-500"
              />
              <StatCard
                icon={<ShieldAlert className="h-4 w-4" />}
                label="Resolution lag"
                value={
                  analyticsSnapshot.avg_dispute_resolution_hours != null
                    ? `${formatNumber(Math.round(analyticsSnapshot.avg_dispute_resolution_hours))}h`
                    : "—"
                }
                note="Average time to resolve disputed orders"
                color="text-primary"
              />
            </div>
          </section>

          {analyticsSnapshot.top_promotion_types?.length > 0 && (
            <section className="rounded-[28px] border bg-card p-6">
              <h2 className="text-lg font-semibold">Promotion type economics</h2>
              <div className="mt-4 space-y-3">
                {analyticsSnapshot.top_promotion_types.map((item, idx) => {
                  const averageRevenue = item.count > 0 ? item.revenue / item.count : 0;
                  return (
                    <div
                      key={`${item.type}-${idx}`}
                      className="rounded-2xl border bg-background/70 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">
                            {PROMOTION_TYPE_LABELS[item.type] ?? item.type.replace(/_/g, " ")}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatNumber(item.count)} listings contributing {formatNumber(item.revenue)} credits
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg revenue per listing:{" "}
                          <span className="font-semibold text-foreground">
                            {formatNumber(Math.round(averageRevenue))} cr
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-[28px] border bg-card p-6">
            <h2 className="text-lg font-semibold">Platform mix snapshot</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="text-sm font-medium">Active admin listing mix</p>
                <div className="mt-4 space-y-3">
                  {derived.platformMix.length ? (
                    derived.platformMix.map((item) => (
                      <div key={item.platform} className="flex items-center justify-between text-sm">
                        <div>
                          <span>
                            {PROMOTION_PLATFORM_LABELS[
                              item.platform as keyof typeof PROMOTION_PLATFORM_LABELS
                            ] ?? item.platform}
                          </span>
                          {"orders" in item && item.orders > 0 ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatNumber(item.orders)} orders · {formatNumber(item.completed_orders)} completed
                            </p>
                          ) : null}
                        </div>
                        <span className="font-semibold">{formatNumber(item.count)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No listing mix data available from the current admin sample.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="text-sm font-medium">Open dispute concentration</p>
                <div className="mt-4 space-y-3">
                  {derived.disputePlatformMix.length ? (
                    derived.disputePlatformMix.map((item) => (
                      <div key={item.platform} className="flex items-center justify-between text-sm">
                        <span>
                          {PROMOTION_PLATFORM_LABELS[
                            item.platform as keyof typeof PROMOTION_PLATFORM_LABELS
                          ] ?? item.platform}
                        </span>
                        <span className="font-semibold">{formatNumber(item.count)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No open dispute concentration signals in the current admin sample.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {analyticsSnapshot.top_promoters?.length > 0 && (
            <section className="rounded-[28px] border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Star className="h-4 w-4 text-amber-400" />
                Top promoters
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium text-muted-foreground">Promoter</th>
                      <th className="p-2 text-right font-medium text-muted-foreground">Active</th>
                      <th className="p-2 text-right font-medium text-muted-foreground">Orders</th>
                      <th className="p-2 text-right font-medium text-muted-foreground">Revenue</th>
                      <th className="p-2 text-right font-medium text-muted-foreground">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analyticsSnapshot.top_promoters as unknown as TopPromoterRow[]).map(
                      (promoter, idx) => (
                        <tr key={`${promoter.id}-${idx}`} className="border-b last:border-0">
                          <td className="p-2 font-medium">{promoter.name}</td>
                          <td className="p-2 text-right">{formatNumber(promoter.active_promotions ?? 0)}</td>
                          <td className="p-2 text-right">{formatNumber(promoter.total_orders ?? 0)}</td>
                          <td className="p-2 text-right">
                            {formatNumber(promoter.total_revenue_credits ?? 0)} cr
                          </td>
                          <td className="p-2 text-right">
                            {promoter.avg_rating?.toFixed(1) || "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border bg-card p-6">
            <h2 className="text-lg font-semibold">Risk readout</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="text-sm font-medium">Highest current risk lane</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {derived.highestRiskPlatform
                    ? `${PROMOTION_PLATFORM_LABELS[
                        derived.highestRiskPlatform.platform as keyof typeof PROMOTION_PLATFORM_LABELS
                      ] ?? derived.highestRiskPlatform.platform} is leading the current open dispute sample.`
                    : "No concentrated risk lane is visible in the current open dispute sample."}
                </p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <p className="text-sm font-medium">Operational next step</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use disputes plus listing targeting coverage to decide which platform-specific proof rules need tightening next.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border bg-card p-6">
            <h2 className="text-lg font-semibold">What still needs backend depth</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Platform-level conversion and dispute metrics should eventually come from dedicated backend analytics, not admin-sample snapshots.</p>
              <p>Radio, DJ, and creator offers still need first-class structured proof fields in the API.</p>
              <p>Repeat-buyer behavior and settlement lag are not yet exposed as canonical metrics.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
