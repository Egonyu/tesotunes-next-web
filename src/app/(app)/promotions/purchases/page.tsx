"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyPurchases } from "@/hooks/usePromotions";
import {
  OrderCard,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import type { OrderStatus } from "@/types/promotions";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending_verification", label: "Pending" },
  { value: "verification_submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
  { value: "disputed", label: "Disputed" },
  { value: "refunded", label: "Refunded" },
];

export default function PromotionPurchasesPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyPurchases({
    status: status || undefined,
    page,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">My Promotion Purchases</h1>
          <p className="text-sm text-muted-foreground">
            Track your purchased promotions and submit verifications
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
          title="No purchases found"
          description="You haven't purchased any promotions yet. Browse the marketplace to get started."
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() =>
                  router.push(`/promotions/purchases/${order.id}`)
                }
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
