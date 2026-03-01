"use client";

import { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  useAdminDisputes,
  useAdminResolveDispute,
} from "@/hooks/usePromotions";
import {
  OrderStatusBadge,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import type { DisputeResolution, PromotionOrder } from "@/types/promotions";

export default function AdminDisputesPage() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolution, setResolution] = useState<DisputeResolution>("refund_buyer");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useAdminDisputes({ status, page });
  const resolve = useAdminResolveDispute();

  const handleResolve = (orderId: number) => {
    resolve.mutate(
      { disputeId: orderId, data: { resolution, notes } },
      {
        onSuccess: () => {
          setResolvingId(null);
          setNotes("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/promotions"
          className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Dispute Resolution
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and resolve disputes between buyers and sellers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {[
          { value: "open", label: "Open Disputes" },
          { value: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              status === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Disputes */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !data?.data?.length ? (
        <PromotionsEmptyState
          title="No disputes"
          description={
            status === "open"
              ? "No open disputes at the moment."
              : "No resolved disputes found."
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((order: PromotionOrder) => (
              <div
                key={order.id}
                className="bg-card border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      Order #{order.order_number || order.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.promotion?.title}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Buyer</p>
                    <p className="font-medium">{order.buyer?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Seller</p>
                    <p className="font-medium">
                      {order.promotion?.promoter?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {order.total_credits} credits
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Filed</p>
                    <p className="font-medium">
                      {order.dispute?.created_at
                        ? formatDate(order.dispute.created_at)
                        : formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                {/* Dispute reason */}
                {order.dispute && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                      Dispute Reason
                    </p>
                    <p className="text-sm">{order.dispute.reason}</p>
                    {order.dispute.evidence_url && (
                      <a
                        href={order.dispute.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View Evidence
                      </a>
                    )}
                  </div>
                )}

                {/* Resolve section */}
                {order.status === "disputed" && (
                  <>
                    {resolvingId === order.id ? (
                      <div className="border-t pt-3 space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-1.5">
                            Resolution
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setResolution("refund_buyer")}
                              className={cn(
                                "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                                resolution === "refund_buyer"
                                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400"
                                  : "hover:bg-muted"
                              )}
                            >
                              <XCircle className="h-4 w-4 inline mr-1" />
                              Refund Buyer
                            </button>
                            <button
                              onClick={() =>
                                setResolution("release_to_seller")
                              }
                              className={cn(
                                "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                                resolution === "release_to_seller"
                                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                  : "hover:bg-muted"
                              )}
                            >
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Release to Seller
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1.5">
                            Admin Notes
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Explain the resolution decision..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolve(order.id)}
                            disabled={!notes || resolve.isPending}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2"
                          >
                            {resolve.isPending && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Resolve Dispute
                          </button>
                          <button
                            onClick={() => setResolvingId(null)}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setResolvingId(order.id);
                          setResolution("refund_buyer");
                          setNotes("");
                        }}
                        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Resolve this dispute
                      </button>
                    )}
                  </>
                )}

                {/* Resolved info */}
                {order.dispute?.resolution && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium mb-1">Resolution</p>
                    <p className="text-sm capitalize">
                      {order.dispute.resolution.replace(/_/g, " ")}
                    </p>
                    {order.dispute.admin_notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.dispute.admin_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {data.meta && (
            <PromotionsPagination
              currentPage={data.meta.current_page}
              lastPage={data.meta.last_page}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
