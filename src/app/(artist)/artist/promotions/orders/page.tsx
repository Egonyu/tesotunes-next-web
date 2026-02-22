"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  useMyPromotionOrders,
  useVerifyOrder,
  useRejectOrder,
} from "@/hooks/usePromotions";
import {
  OrderStatusBadge,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending_verification", label: "Pending" },
  { value: "verification_submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
  { value: "disputed", label: "Disputed" },
];

export default function ArtistPromotionOrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState("pending_verification");
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useMyPromotionOrders({
    status: status || undefined,
    page,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Verification Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review and verify orders for your promotions
          </p>
        </div>
      </div>

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

      {/* Orders */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !data?.data?.length ? (
        <PromotionsEmptyState
          title="No orders in queue"
          description="Orders will appear here when buyers purchase your promotions."
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                isRejecting={rejectingId === order.id}
                rejectReason={rejectReason}
                onRejectReasonChange={setRejectReason}
                onStartReject={() => {
                  setRejectingId(order.id);
                  setRejectReason("");
                }}
                onCancelReject={() => setRejectingId(null)}
              />
            ))}
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

// ---------------------------------------------------------------------------
// Order Row Component
// ---------------------------------------------------------------------------

import type { PromotionOrder } from "@/types/promotions";

function OrderRow({
  order,
  isRejecting,
  rejectReason,
  onRejectReasonChange,
  onStartReject,
  onCancelReject,
}: {
  order: PromotionOrder;
  isRejecting: boolean;
  rejectReason: string;
  onRejectReasonChange: (v: string) => void;
  onStartReject: () => void;
  onCancelReject: () => void;
}) {
  const verify = useVerifyOrder(order.id);
  const reject = useRejectOrder(order.id);

  const handleVerify = () => {
    verify.mutate({ verified: true, notes: "Completed as requested" });
  };

  const handleReject = () => {
    reject.mutate({ reason: rejectReason }, { onSuccess: onCancelReject });
  };

  const canVerify =
    order.status === "pending_verification" ||
    order.status === "verification_submitted";

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">
              {order.order_number}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <h4 className="font-medium text-sm">{order.promotion.title}</h4>
          <p className="text-xs text-muted-foreground">
            Buyer: {order.buyer.name} · {formatDate(order.created_at)}
          </p>
          {order.song && (
            <p className="text-xs text-muted-foreground">
              Song: {order.song.title} by {order.song.artist.name}
            </p>
          )}
          {order.notes && (
            <p className="text-xs bg-muted/50 rounded p-2 mt-1">
              {order.notes}
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          {order.total_credits > 0 && (
            <div className="text-sm font-semibold text-primary">
              {order.total_credits} cr
            </div>
          )}
          {order.total_ugx > 0 && (
            <div className="text-xs text-muted-foreground">
              {formatCurrency(order.total_ugx)}
            </div>
          )}
        </div>
      </div>

      {/* Verification proof */}
      {order.verification.verification_url && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium">Verification Proof</p>
          <a
            href={order.verification.verification_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-xs flex items-center gap-1 hover:underline"
          >
            View proof <ExternalLink className="h-3 w-3" />
          </a>
          {order.verification.verification_notes && (
            <p className="text-xs text-muted-foreground">
              {order.verification.verification_notes}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {canVerify && !isRejecting && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <button
            onClick={handleVerify}
            disabled={verify.isPending}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {verify.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            Verify &amp; Release Payment
          </button>
          <button
            onClick={onStartReject}
            className="flex items-center gap-1.5 border border-destructive text-destructive px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-destructive/10"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      )}

      {/* Reject form */}
      {isRejecting && (
        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 space-y-2 border border-destructive/20">
          <label className="text-xs font-medium text-destructive">
            Rejection Reason *
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            placeholder="Explain why you're rejecting..."
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-destructive/20 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={!rejectReason || reject.isPending}
              className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60 flex items-center gap-1.5"
            >
              {reject.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Confirm Rejection
            </button>
            <button
              onClick={onCancelReject}
              className="px-3 py-1.5 text-xs text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
