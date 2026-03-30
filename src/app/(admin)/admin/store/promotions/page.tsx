"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Eye,
  Loader2,
  Megaphone,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import {
  useAdminAnalytics,
  useAdminPromotions,
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

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminStorePromotionsPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: analytics } = useAdminAnalytics();
  const { data, isLoading, isError } = useAdminPromotions({
    status: status || undefined,
    page,
    search: search || undefined,
  });

  const getTypeLabel = (value: string) =>
    PROMOTION_TYPE_LABELS[value as keyof typeof PROMOTION_TYPE_LABELS] ??
    value.replace(/_/g, " ");

  const getPlatformLabel = (value: string) =>
    PROMOTION_PLATFORM_LABELS[value as keyof typeof PROMOTION_PLATFORM_LABELS] ??
    value.replace(/_/g, " ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/store" className="rounded-lg p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Store Promotions</h1>
          <p className="text-muted-foreground">
            Reconciled view of the live promotions marketplace used across seller, buyer, and admin flows.
          </p>
        </div>
        <Link
          href="/admin/store/promotions/create"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          Creation Flow
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Reconciliation Note
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Store campaign pages were pointing at retired endpoints.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This page now reads from the same marketplace moderation data as
              `/admin/promotions`, so listings here should always match what the
              public `/promotions` page and seller dashboards are using.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/promotions"
              className="rounded-full border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Open moderation queue
            </Link>
            <Link
              href="/admin/promotions/analytics"
              className="rounded-full border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Open analytics
            </Link>
            <Link
              href="/promotions"
              className="rounded-full border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              View public marketplace
            </Link>
          </div>
        </div>
      </section>

      {analytics && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Megaphone className="h-3.5 w-3.5" />
              Total Listings
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.total_promotions)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Active
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.active_promotions)}</p>
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
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by listing title or promoter..."
            className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm"
          />
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <PromotionsEmptyState
          title="Marketplace data unavailable"
          description="This bridge now depends on the live promotions admin API. If this is empty unexpectedly, check the local backend connection."
        />
      ) : !data?.data?.length ? (
        <PromotionsEmptyState
          title="No promotion listings found"
          description="Try switching the status tab or clearing the current search."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-4 text-left font-medium text-muted-foreground">Listing</th>
                  <th className="p-4 text-left font-medium text-muted-foreground hidden md:table-cell">Promoter</th>
                  <th className="p-4 text-left font-medium text-muted-foreground hidden lg:table-cell">Type / Platform</th>
                  <th className="p-4 text-left font-medium text-muted-foreground hidden sm:table-cell">Commercials</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Links</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((promotion) => (
                  <tr key={promotion.id} className="border-b last:border-0">
                    <td className="p-4">
                      <p className="font-medium">{promotion.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {promotion.short_description}
                      </p>
                    </td>
                    <td className="hidden p-4 md:table-cell">
                      <div className="flex items-center gap-2">
                        <span>{promotion.promoter.name}</span>
                        {promotion.promoter.is_verified && (
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        @{promotion.promoter.username}
                      </p>
                    </td>
                    <td className="hidden p-4 text-muted-foreground lg:table-cell">
                      <p className="capitalize">{getTypeLabel(promotion.type)}</p>
                      <p className="mt-1 text-xs capitalize">{getPlatformLabel(promotion.platform)}</p>
                    </td>
                    <td className="hidden p-4 sm:table-cell">
                      <p>{formatNumber(promotion.price_credits)} cr</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCurrency(promotion.price_ugx)}
                      </p>
                    </td>
                    <td className="p-4">
                      <PromotionStatusBadge status={promotion.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/promotions`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          Moderate
                        </Link>
                        <Link
                          href={`/promotions/${promotion.slug}`}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PromotionsPagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
