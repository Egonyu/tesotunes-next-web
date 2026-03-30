"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { getPromotionProofGuide } from "@/lib/promotions-proof";
import {
  useAdminAnalytics,
  useAdminDisputes,
  useAdminResolveDispute,
} from "@/hooks/usePromotions";
import {
  OrderStatusBadge,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import {
  DISPUTE_REASON_LABELS,
  PROMOTION_PLATFORM_LABELS,
  PROMOTION_TYPE_LABELS,
  type DisputeResolution,
  type PromotionOrder,
} from "@/types/promotions";

export default function AdminDisputesPage() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolution, setResolution] = useState<DisputeResolution>("refund_buyer");
  const [notes, setNotes] = useState("");

  const { data, isLoading, isError } = useAdminDisputes({ status, page });
  const { data: analytics } = useAdminAnalytics();
  const resolve = useAdminResolveDispute();

  const disputes = data?.data ?? [];

  const summary = useMemo(() => {
    const refundCandidates = disputes.filter(
      (order) => order.dispute?.resolution === "refund_buyer"
    ).length;
    const sellerReleaseCandidates = disputes.filter(
      (order) => order.dispute?.resolution === "release_to_seller"
    ).length;

    return {
      visible: disputes.length,
      refundCandidates,
      sellerReleaseCandidates,
    };
  }, [disputes]);

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
      <section className="rounded-[28px] border border-primary/20 bg-primary/5 p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <ShieldAlert className="h-3.5 w-3.5" />
              Promotions Dispute Desk
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Review and resolve promotion marketplace conflicts
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              This queue is fed by the same canonical promotion orders used by buyers,
              sellers, moderation, and analytics. Resolve disputes with a refund or
              release decision and keep a clear audit trail.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[34rem]">
            <Link
              href="/admin/promotions"
              className="rounded-2xl border bg-background px-4 py-4 transition hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">Moderation Queue</p>
              <p className="mt-1 text-xs text-muted-foreground">Return to listing approvals</p>
            </Link>
            <Link
              href="/admin/promotions/analytics"
              className="rounded-2xl border bg-background px-4 py-4 transition hover:bg-muted"
            >
              <CreditCard className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">Analytics</p>
              <p className="mt-1 text-xs text-muted-foreground">Review GMV and dispute rate</p>
            </Link>
            <Link
              href="/promotions/purchases"
              className="rounded-2xl border bg-background px-4 py-4 transition hover:bg-muted"
            >
              <RefreshCw className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">Buyer Journey</p>
              <p className="mt-1 text-xs text-muted-foreground">See the post-purchase flow</p>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            Visible Cases
          </div>
          <p className="text-2xl font-bold">{formatNumber(summary.visible)}</p>
          <p className="text-xs text-muted-foreground">
            Cases in the current {status} queue.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" />
            Platform Rate
          </div>
          <p className="text-2xl font-bold">
            {analytics ? `${(analytics.dispute_rate * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            Marketplace-wide dispute incidence.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <XCircle className="h-3.5 w-3.5" />
            Refund Decisions
          </div>
          <p className="text-2xl font-bold">{formatNumber(summary.refundCandidates)}</p>
          <p className="text-xs text-muted-foreground">
            Cases on this page already resolved in favor of buyers.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5" />
            Seller Releases
          </div>
          <p className="text-2xl font-bold">{formatNumber(summary.sellerReleaseCandidates)}</p>
          <p className="text-xs text-muted-foreground">
            Cases on this page resolved in favor of sellers.
          </p>
        </div>
      </div>

      <section className="rounded-[28px] border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Dispute Queue</h2>
            <p className="text-sm text-muted-foreground">
              Review evidence, understand the context, then choose refund or release.
            </p>
          </div>
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
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
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
            title="Couldn’t load disputes"
            description="Check the local backend connection, then refresh the dispute queue."
          />
        ) : disputes.length === 0 ? (
          <PromotionsEmptyState
            title="No disputes found"
            description={
              status === "open"
                ? "No open promotion disputes are waiting for review."
                : "No resolved promotion disputes were returned for this page."
            }
          />
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {disputes.map((order: PromotionOrder) => (
                <article key={order.id} className="rounded-[24px] border bg-background/70 p-5">
                  {(() => {
                    const guide = getPromotionProofGuide(
                      order.promotion.platform,
                      order.promotion.type
                    );
                    const riskFlags = [
                      !order.verification.verification_url ? "Missing proof URL" : null,
                      !order.verification.verification_notes ? "Thin proof notes" : null,
                      !order.dispute?.evidence_url &&
                      !(order.dispute?.evidence_files?.length ?? 0)
                        ? "No buyer dispute evidence"
                        : null,
                      order.promotion.platform === "radio"
                        ? "Check station or airtime evidence"
                        : null,
                      order.promotion.platform === "club"
                        ? "Check venue or set context"
                        : null,
                    ].filter(Boolean) as string[];

                    return (
                      <>
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        {order.dispute?.resolution && (
                          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground capitalize">
                            {order.dispute.resolution.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <h3 className="text-xl font-semibold">
                          Order #{order.order_number || order.id}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {order.promotion?.title || "Promotion listing unavailable"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            {PROMOTION_PLATFORM_LABELS[order.promotion.platform]}
                          </span>
                          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            {PROMOTION_TYPE_LABELS[order.promotion.type]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border bg-card px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Buyer</p>
                          <p className="mt-2 font-semibold">{order.buyer?.name || "—"}</p>
                        </div>
                        <div className="rounded-2xl border bg-card px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Seller</p>
                          <p className="mt-2 font-semibold">{order.promotion?.promoter?.name || "—"}</p>
                        </div>
                        <div className="rounded-2xl border bg-card px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Commercials</p>
                          <p className="mt-2 font-semibold">{formatNumber(order.total_credits)} credits</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(order.total_ugx)}</p>
                        </div>
                        <div className="rounded-2xl border bg-card px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Filed</p>
                          <p className="mt-2 font-semibold">
                            {order.dispute?.created_at
                              ? formatDate(order.dispute.created_at)
                              : formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      {order.dispute && (
                        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                            Dispute reason
                          </p>
                          <p className="mt-2 text-sm">{order.dispute.reason || order.dispute.dispute_reason}</p>
                          {order.dispute.reason_code ? (
                            <div className="mt-3 inline-flex rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground/80">
                              {DISPUTE_REASON_LABELS[order.dispute.reason_code]}
                            </div>
                          ) : null}
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border bg-card px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Dispute state
                              </p>
                              <p className="mt-2 font-semibold capitalize">
                                {order.dispute.state ?? "open"}
                              </p>
                            </div>
                            {order.dispute.settlement_status ? (
                              <div className="rounded-2xl border bg-card px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                  Settlement state
                                </p>
                                <p className="mt-2 font-semibold capitalize">
                                  {order.dispute.settlement_status.replace(/_/g, " ")}
                                </p>
                              </div>
                            ) : null}
                          </div>
                          <div className="mt-4 rounded-2xl border bg-background/80 p-4">
                            <p className="text-sm font-medium">{guide.title}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {guide.sellerPrompt}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {riskFlags.length ? (
                                riskFlags.map((flag) => (
                                  <span
                                    key={flag}
                                    className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                                  >
                                    {flag}
                                  </span>
                                ))
                              ) : (
                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                  Proof package looks complete
                                </span>
                              )}
                            </div>
                            <div className="mt-4 space-y-2">
                              {guide.checklist.map((item) => (
                                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {order.dispute.evidence_url && (
                            <a
                              href={order.dispute.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                              View evidence
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          )}
                          {order.dispute.evidence_files?.length ? (
                            <div className="mt-3 rounded-2xl border bg-background/80 p-4">
                              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                Evidence files
                              </p>
                              <div className="mt-2 space-y-2">
                                {order.dispute.evidence_files.map((file) => (
                                  <a
                                    key={file}
                                    href={file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-primary hover:underline"
                                  >
                                    {file}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {order.dispute?.resolution && (
                        <div className="mt-5 rounded-2xl border bg-card p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            Resolution record
                          </p>
                          <p className="mt-2 text-sm capitalize">
                            {order.dispute.resolution.replace(/_/g, " ")}
                          </p>
                          {order.dispute.admin_notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {order.dispute.admin_notes}
                            </p>
                          )}
                          {order.dispute.refund_reason &&
                          order.dispute.resolution === "refund_buyer" ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Refund reason: {order.dispute.refund_reason}
                            </p>
                          ) : null}
                          {order.dispute.resolved_at && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Resolved {formatDate(order.dispute.resolved_at)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-col gap-2 xl:w-64">
                      <Link
                        href={order.promotion ? `/promotions/${order.promotion.slug}` : "/admin/promotions"}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted"
                      >
                        View listing
                      </Link>

                      {order.status === "disputed" ? (
                        resolvingId === order.id ? (
                          <div className="rounded-2xl border bg-card p-4">
                            <p className="text-sm font-medium">Resolve dispute</p>
                            <div className="mt-3 flex flex-col gap-2">
                              <button
                                onClick={() => setResolution("refund_buyer")}
                                className={cn(
                                  "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                                  resolution === "refund_buyer"
                                    ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                    : "hover:bg-muted"
                                )}
                              >
                                <XCircle className="mr-2 inline h-4 w-4" />
                                Refund buyer
                              </button>
                              <button
                                onClick={() => setResolution("release_to_seller")}
                                className={cn(
                                  "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                                  resolution === "release_to_seller"
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : "hover:bg-muted"
                                )}
                              >
                                <CheckCircle className="mr-2 inline h-4 w-4" />
                                Release to seller
                              </button>
                            </div>

                            <textarea
                              value={notes}
                              onChange={(event) => setNotes(event.target.value)}
                              placeholder="Explain the decision for auditability and future reference..."
                              rows={4}
                              className="mt-3 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                            />

                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleResolve(order.id)}
                                disabled={!notes || resolve.isPending}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                              >
                                {resolve.isPending ? "Resolving..." : "Resolve"}
                              </button>
                              <button
                                onClick={() => setResolvingId(null)}
                                className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
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
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Resolve dispute
                          </button>
                        )
                      ) : (
                        <Link
                          href="/admin/promotions/analytics"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted"
                        >
                          Review analytics
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                      </>
                    );
                  })()}
                </article>
              ))}
            </div>

            {data?.meta && (
              <PromotionsPagination
                currentPage={data.meta.current_page}
                lastPage={data.meta.last_page}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
