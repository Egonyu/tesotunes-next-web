"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Loader2,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { useMyPromotionOrders } from "@/hooks/usePromotions";
import {
  OrderCard,
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

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border bg-card px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

export default function ArtistPromotionOrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMyPromotionOrders({
    status: status || undefined,
    page,
  });

  const orders = data?.data ?? [];

  const summary = useMemo(() => {
    const totalCredits = orders.reduce((sum, order) => sum + order.total_credits, 0);
    const totalUgx = orders.reduce((sum, order) => sum + order.total_ugx, 0);

    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending_verification").length,
      submitted: orders.filter((order) => order.status === "verification_submitted").length,
      completed: orders.filter((order) => order.status === "completed").length,
      disputed: orders.filter((order) => order.status === "disputed").length,
      totalCredits,
      totalUgx,
    };
  }, [orders]);

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border bg-card p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Seller Verification Queue
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Review buyer proof and complete promotion delivery
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              This queue is where you confirm completed campaigns, reject invalid proof,
              or investigate disputes. It runs on the same canonical order records used by buyers and admins.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/artist/promotions"
                className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Back to promotions
              </Link>
              <Link
                href="/artist/promotions/profile"
                className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Improve promoter profile
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border bg-background/70 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Escrow release point</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Verifying an order releases seller settlement through the marketplace flow.
              </p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Buyer-visible outcome</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your verification or rejection directly shapes buyer trust and future reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Orders" value={formatNumber(summary.total)} note="Visible in this queue" />
        <Stat label="Pending" value={formatNumber(summary.pending)} note="Awaiting buyer proof" />
        <Stat label="Submitted" value={formatNumber(summary.submitted)} note="Ready for review" />
        <Stat label="Completed" value={formatNumber(summary.completed)} note="Already verified" />
        <Stat label="Credits" value={formatNumber(summary.totalCredits)} note="Credits represented here" />
        <Stat label="UGX" value={formatCurrency(summary.totalUgx)} note="Cash value represented here" />
      </section>

      <section className="rounded-[28px] border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Verification Queue</h2>
            <p className="text-sm text-muted-foreground">
              Filter by order stage, then open an order to verify proof or reject and refund the buyer.
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
          <div className="mt-6 space-y-4">
            <PromotionsEmptyState
              title="We couldn’t load seller orders"
              description="Check the local API connection, then refresh this queue."
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Retry page
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 space-y-4">
            <PromotionsEmptyState
              title="No orders in queue"
              description="Orders will appear here when buyers purchase your promotions."
            />
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/promotions"
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                View marketplace
              </Link>
              <Link
                href="/artist/promotions"
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Manage listings
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-[24px] border bg-background/70 p-2">
                  <OrderCard
                    order={order}
                    showBuyer
                    onClick={() => router.push(`/artist/promotions/orders/${order.id}`)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="rounded-2xl border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                Open any order to inspect proof, verify delivery, or reject with a refund reason.
              </div>
              <Link
                href="/artist/promotions"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Back to seller dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <PromotionsPagination
              currentPage={data?.meta.current_page ?? 1}
              lastPage={data?.meta.last_page ?? 1}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Review proof carefully</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Confirm that links, screenshots, posts, or playback evidence match what the listing promised.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Verify only real delivery</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Approval triggers settlement, so use it when the buyer has received the agreed promotional service.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Reject with clarity</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            If proof is invalid, give a specific reason so the refund and dispute trail stays understandable.
          </p>
        </div>
      </section>
    </div>
  );
}
