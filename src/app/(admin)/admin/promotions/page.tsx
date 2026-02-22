"use client";

import { useState } from "react";
import {
  Loader2,
  Megaphone,
  CheckCircle,
  XCircle,
  BarChart3,
  AlertTriangle,
  Users,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import {
  useAdminPromotions,
  useAdminApprovePromotion,
  useAdminRejectPromotion,
  useAdminAnalytics,
} from "@/hooks/usePromotions";
import {
  PromotionStatusBadge,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import { PROMOTION_TYPE_LABELS, PROMOTION_PLATFORM_LABELS } from "@/types/promotions";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending Approval" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPromotionsPage() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useAdminPromotions({
    status: status || undefined,
    page,
    search: search || undefined,
  });
  const { data: analytics } = useAdminAnalytics();

  const approve = useAdminApprovePromotion();
  const reject = useAdminRejectPromotion();

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Promotions Management</h1>
          <p className="text-sm text-muted-foreground">
            Approve, reject, and manage promotion campaigns
          </p>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Megaphone className="h-3.5 w-3.5" />
              Total
            </div>
            <p className="text-xl font-bold">{analytics.total_promotions}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Active
            </div>
            <p className="text-xl font-bold">{analytics.active_promotions}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3.5 w-3.5" />
              Orders
            </div>
            <p className="text-xl font-bold">
              {formatNumber(analytics.total_orders)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CreditCard className="h-3.5 w-3.5" />
              GMV (Credits)
            </div>
            <p className="text-xl font-bold">
              {formatNumber(analytics.total_gmv_credits)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Dispute Rate
            </div>
            <p className="text-xl font-bold">
              {(analytics.dispute_rate * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search promotions by title or promoter..."
        className="w-full max-w-md px-4 py-2.5 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

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

      {/* Promotions list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !data?.data?.length ? (
        <PromotionsEmptyState
          title="No promotions found"
          description="No promotions match the current filters."
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
                    Promoter
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">
                    Type / Platform
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Price
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
                      <p className="text-xs text-muted-foreground">
                        {formatDate(promo.created_at)}
                      </p>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{promo.promoter.name}</span>
                        {promo.promoter.is_verified && (
                          <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">
                      <p className="text-xs">
                        {PROMOTION_TYPE_LABELS[promo.type]}
                      </p>
                      <p className="text-xs">
                        {PROMOTION_PLATFORM_LABELS[promo.platform]}
                      </p>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <p className="text-sm">{promo.price_credits} cr</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(promo.price_ugx)}
                      </p>
                    </td>
                    <td className="p-3">
                      <PromotionStatusBadge status={promo.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {promo.status === "pending" && (
                          <>
                            <button
                              onClick={() => approve.mutate(promo.id)}
                              disabled={approve.isPending}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(promo.id);
                                setRejectReason("");
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </>
                        )}
                        {promo.status !== "pending" && (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>

                      {/* Inline reject form */}
                      {rejectingId === promo.id && (
                        <div className="mt-2 text-left bg-red-50 dark:bg-red-900/10 rounded p-2 space-y-2">
                          <textarea
                            value={rejectReason}
                            onChange={(e) =>
                              setRejectReason(e.target.value)
                            }
                            placeholder="Reason for rejection..."
                            rows={2}
                            className="w-full px-2 py-1 text-xs border rounded bg-background resize-none"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleReject(promo.id)}
                              disabled={
                                !rejectReason || reject.isPending
                              }
                              className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs disabled:opacity-60"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRejectingId(null)}
                              className="px-2 py-1 text-xs text-muted-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
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
