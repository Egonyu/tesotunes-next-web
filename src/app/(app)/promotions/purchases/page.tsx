"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { useMyPurchases } from "@/hooks/usePromotions";
import {
  OrderCard,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending_verification", label: "Pending" },
  { value: "verification_submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
  { value: "disputed", label: "Disputed" },
  { value: "refunded", label: "Refunded" },
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

export default function PromotionPurchasesPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMyPurchases({
    status: status || undefined,
    page,
  });

  const orders = data?.data ?? [];

  const summary = useMemo(() => {
    const totalCredits = orders.reduce((sum, order) => sum + order.total_credits, 0);
    const totalUgx = orders.reduce((sum, order) => sum + order.total_ugx, 0);

    return {
      totalOrders: orders.length,
      pending: orders.filter((order) => order.status === "pending_verification").length,
      completed: orders.filter((order) => order.status === "completed").length,
      disputed: orders.filter((order) => order.status === "disputed").length,
      totalCredits,
      totalUgx,
    };
  }, [orders]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <section className="rounded-[28px] border bg-card p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <ShoppingBag className="h-3.5 w-3.5" />
                Promotion Purchases
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                Manage your booked promotion services
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                Track delivery, submit proof, raise disputes when expectations are missed,
                and review promoters after successful campaigns.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/promotions"
                  className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Browse more services
                </Link>
                <Link
                  href="/artist/promotions"
                  className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Open seller dashboard
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Buyer workflow</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Each order now flows through purchase, proof submission, dispute handling, and review on the same marketplace contract.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Escrow-backed</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Payments stay protected until delivery is verified or a dispute is resolved.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Stat
            label="Orders"
            value={formatNumber(summary.totalOrders)}
            note="Visible in the current tab"
          />
          <Stat
            label="Pending"
            value={formatNumber(summary.pending)}
            note="Waiting for proof"
          />
          <Stat
            label="Completed"
            value={formatNumber(summary.completed)}
            note="Delivered orders"
          />
          <Stat
            label="Disputed"
            value={formatNumber(summary.disputed)}
            note="Cases under review"
          />
          <Stat
            label="Credits"
            value={formatNumber(summary.totalCredits)}
            note="Credits represented here"
          />
          <Stat
            label="UGX"
            value={formatCurrency(summary.totalUgx)}
            note="Cash amount represented here"
          />
        </section>

        <section className="rounded-[28px] border bg-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Order Queue</h2>
              <p className="text-sm text-muted-foreground">
                Filter by lifecycle stage and open any order for verification, dispute, or review actions.
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
                title="We couldn’t load your purchases"
                description="Check the local API connection, then refresh this page."
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
                title="No purchases found"
                description="You haven't purchased any promotions yet. Browse the marketplace to get started."
              />
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/promotions"
                  className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Browse marketplace
                </Link>
                <Link
                  href="/artist/promotions"
                  className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Become a seller
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[24px] border bg-background/70 p-2"
                  >
                    <OrderCard
                      order={order}
                      onClick={() => router.push(`/promotions/purchases/${order.id}`)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="rounded-2xl border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  Open any order to submit proof, raise a dispute, or leave a review after delivery.
                </div>
                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Book another promotion
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
              <h3 className="font-semibold">Submit proof quickly</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              If a promoter has completed delivery, open the order and attach a proof link so the workflow can continue cleanly.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Dispute with context</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Escalate only when scope, timing, or deliverables are materially off. Your notes feed the admin dispute desk directly.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Review completed work</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Reviews strengthen the marketplace by helping future artists understand which promoters actually deliver.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
