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
import type { PromotionStatus } from "@/types/promotions";
import { PROMOTION_TYPE_LABELS } from "@/types/promotions";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">My Promotions</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your promotional services
            </p>
          </div>
        </div>
        <Link
          href="/artist/promotions/create"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Promotion
        </Link>
      </div>

      {/* Analytics cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Megaphone className="h-3.5 w-3.5" />
              Active
            </div>
            <p className="text-2xl font-bold">{analytics.active_promotions}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3.5 w-3.5" />
              Total Orders
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(analytics.total_orders)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
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
          <div className="bg-card border rounded-lg p-4">
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
          <div className="bg-card border rounded-lg p-4">
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
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <BarChart3 className="h-3.5 w-3.5" />
              Settled
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(analytics.settled_orders)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
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

      {/* Tabs */}
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

      {/* Promotions table */}
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
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    Promotion
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">
                    Type
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Price
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">
                    Orders
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((promo) => (
                  <tr key={promo.id} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium truncate max-w-[200px]">
                        {promo.title}
                      </p>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {PROMOTION_TYPE_LABELS[promo.type]}
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {promo.price_credits} cr
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {promo.completed_orders}/{promo.total_orders}
                    </td>
                    <td className="p-3">
                      <PromotionStatusBadge status={promo.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            router.push(
                              `/artist/promotions/${promo.id}/edit`
                            )
                          }
                          className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
                        >
                          Edit
                        </button>
                        {promo.status === "active" && (
                          <button
                            onClick={() => pause.mutate(promo.id)}
                            className="px-2 py-1 text-xs rounded hover:bg-amber-50 text-amber-600 transition-colors"
                          >
                            Pause
                          </button>
                        )}
                        {promo.status === "paused" && (
                          <button
                            onClick={() => activate.mutate(promo.id)}
                            className="px-2 py-1 text-xs rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this promotion?"
                              )
                            ) {
                              remove.mutate(promo.id);
                            }
                          }}
                          className="px-2 py-1 text-xs rounded hover:bg-red-50 text-destructive transition-colors"
                        >
                          Delete
                        </button>
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
