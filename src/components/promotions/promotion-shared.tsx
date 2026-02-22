"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  PromotionOrder,
  OrderStatus,
} from "@/types/promotions";
import { ORDER_STATUS_LABELS } from "@/types/promotions";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Ban,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

const statusConfig: Record<
  OrderStatus,
  { color: string; icon: React.ElementType }
> = {
  pending_verification: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  verification_submitted: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  completed: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  disputed: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: AlertTriangle },
  refunded: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: RotateCcw },
  cancelled: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: Ban },
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Order Card (compact, for list views)
// ---------------------------------------------------------------------------

interface OrderCardProps {
  order: PromotionOrder;
  onClick?: () => void;
  showBuyer?: boolean;
  className?: string;
}

export function OrderCard({ order, onClick, showBuyer, className }: OrderCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg p-4 hover:border-primary/30 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {order.order_number}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <h4 className="font-medium text-sm truncate">
            {order.promotion.title}
          </h4>
          {showBuyer && (
            <p className="text-xs text-muted-foreground">
              Buyer: {order.buyer.name}
            </p>
          )}
          {order.song && (
            <p className="text-xs text-muted-foreground">
              Song: {order.song.title} by {order.song.artist.name}
            </p>
          )}
        </div>

        <div className="text-right shrink-0 space-y-1">
          {order.total_credits > 0 && (
            <div className="text-sm font-semibold text-primary">
              {order.total_credits} credits
            </div>
          )}
          {order.total_ugx > 0 && (
            <div className="text-xs text-muted-foreground">
              {formatCurrency(order.total_ugx)}
            </div>
          )}
          <div className="text-[10px] text-muted-foreground">
            {formatDate(order.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Promotion Status Badge (for seller / admin)
// ---------------------------------------------------------------------------

import type { PromotionStatus } from "@/types/promotions";
import { PROMOTION_STATUS_LABELS } from "@/types/promotions";

const promotionStatusColors: Record<PromotionStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  expired: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function PromotionStatusBadge({
  status,
  className,
}: {
  status: PromotionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        promotionStatusColors[status],
        className
      )}
    >
      {PROMOTION_STATUS_LABELS[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

export function PromotionsEmptyState({
  title = "No promotions found",
  description = "Try adjusting your filters or check back later.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export function PromotionsPagination({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (
      i === 1 ||
      i === lastPage ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40 hover:bg-muted transition-colors"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "h-8 w-8 text-sm rounded-lg transition-colors",
              p === currentPage
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40 hover:bg-muted transition-colors"
      >
        Next
      </button>
    </div>
  );
}
