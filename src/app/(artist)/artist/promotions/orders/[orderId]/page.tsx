"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import {
  useMyPromotionOrder,
  useRejectOrder,
  useVerifyOrder,
} from "@/hooks/usePromotions";
import { OrderStatusBadge } from "@/components/promotions";
import { getPromotionProofGuide } from "@/lib/promotions-proof";

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

export default function SellerPromotionOrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.orderId);
  const { data: order, isLoading } = useMyPromotionOrder(orderId);
  const verify = useVerifyOrder(orderId);
  const reject = useRejectOrder(orderId);

  const [verificationNotes, setVerificationNotes] = useState("Completed as requested");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const timeline = useMemo(() => {
    if (!order) return [];

    return [
      { label: "Purchased", done: true, date: order.created_at },
      {
        label: "Proof Submitted",
        done:
          order.verification.status === "submitted" ||
          order.verification.status === "verified",
        date: order.verification.submitted_at,
      },
      {
        label: "Settled",
        done: order.status === "completed",
        date: order.completed_at,
      },
    ];
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold">Order Not Found</h2>
        <Link
          href="/artist/promotions/orders"
          className="mt-3 inline-block text-sm text-primary underline"
        >
          Back to seller queue
        </Link>
      </div>
    );
  }

  const canResolve =
    (order.status === "pending_verification" ||
      order.status === "verification_submitted") &&
    order.dispute.state !== "open";
  const proofGuide = getPromotionProofGuide(order.promotion.platform, order.promotion.type);

  return (
    <div className="space-y-8">
      <Link
        href="/artist/promotions/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to verification queue
      </Link>

      <section className="rounded-[28px] border bg-card p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px]">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Seller Order Review
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  {order.promotion.title}
                </h1>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  {order.order_number}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="rounded-2xl border bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                  {order.promotion.featured_image_url ? (
                    <Image
                      src={order.promotion.featured_image_url}
                      alt={order.promotion.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{order.buyer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Buyer for @{order.promotion.promoter.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {timeline.map((step, index) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
                      step.done
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.done ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {step.label}
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={cn(
                        "h-px w-6",
                        step.done ? "bg-emerald-400" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Stat
              label="Credits"
              value={formatNumber(order.total_credits)}
              note="Credits attached to this order"
            />
            <Stat
              label="UGX"
              value={formatCurrency(order.total_ugx)}
              note="Cash amount attached to this order"
            />
            <Stat
              label="Purchased"
              value={formatDate(order.created_at)}
              note="Original order date"
            />
            <Stat
              label="Expected"
              value={formatDate(order.expected_delivery_at)}
              note="Marketplace delivery estimate"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_380px]">
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border bg-card p-5">
              <h2 className="text-lg font-semibold">Buyer Order Context</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Buyer</span>
                  <span>{order.buyer.name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Payment status</span>
                  <span className="capitalize">{order.payment_status}</span>
                </div>
                {order.notes && (
                  <div className="rounded-2xl border bg-background/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Buyer Notes
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border bg-card p-5">
              <h2 className="text-lg font-semibold">Submitted Proof</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Verification status</span>
                  <span className="capitalize">
                    {order.verification.status.replace("_", " ")}
                  </span>
                </div>
                {order.verification.submitted_at && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Submitted</span>
                    <span>{formatDate(order.verification.submitted_at)}</span>
                  </div>
                )}
                {order.verification.verification_url ? (
                  <a
                    href={order.verification.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View proof link
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No proof link submitted yet.</p>
                )}
                {order.verification.verification_notes && (
                  <div className="rounded-2xl border bg-background/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Verification Notes
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {order.verification.verification_notes}
                    </p>
                  </div>
                )}
                {order.verification.rejection_reason && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
                      Rejection reason
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {order.verification.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border bg-card p-5">
              <h2 className="text-lg font-semibold">{proofGuide.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {proofGuide.sellerPrompt}
              </p>
              <div className="mt-4 space-y-2">
                {proofGuide.proofExamples.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border bg-card p-5">
              <h2 className="text-lg font-semibold">Seller review checklist</h2>
              <div className="mt-4 space-y-2">
                {proofGuide.checklist.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {order.dispute.is_disputed && (
            <section className="rounded-[24px] border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h2 className="text-lg font-semibold">Active Dispute Context</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {order.dispute.reason || order.dispute.dispute_reason}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Dispute state
                  </p>
                  <p className="mt-2 text-sm capitalize">
                    {order.dispute.state ?? "open"}
                  </p>
                </div>
                {order.dispute.settlement_status ? (
                  <div className="rounded-2xl border bg-background/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Settlement state
                    </p>
                    <p className="mt-2 text-sm capitalize">
                      {order.dispute.settlement_status.replace(/_/g, " ")}
                    </p>
                  </div>
                ) : null}
              </div>
              {order.dispute.evidence_url ? (
                <a
                  href={order.dispute.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Open dispute evidence
                </a>
              ) : null}
              {order.dispute.resolution_notes ? (
                <div className="mt-4 rounded-2xl border bg-background/70 p-3 text-sm text-muted-foreground">
                  {order.dispute.resolution_notes}
                </div>
              ) : null}
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <section className="rounded-[24px] border bg-card p-5">
              <h2 className="text-lg font-semibold">Resolve Order</h2>
              {canResolve ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
                    {proofGuide.sellerPrompt}
                  </div>
                  <textarea
                    value={verificationNotes}
                    onChange={(event) => setVerificationNotes(event.target.value)}
                    placeholder="Add seller verification notes..."
                    rows={4}
                    className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() =>
                      verify.mutate({ verified: true, notes: verificationNotes })
                    }
                    disabled={verify.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {verify.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Verify and release payment
                  </button>

                  {!showRejectForm ? (
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject and refund buyer
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                      <p className="text-sm font-medium text-destructive">Rejection reason</p>
                      <textarea
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        placeholder="Explain clearly why this proof cannot be accepted..."
                        rows={4}
                        className="mt-3 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            reject.mutate(
                              { reason: rejectReason },
                              { onSuccess: () => setShowRejectForm(false) }
                            )
                          }
                          disabled={!rejectReason || reject.isPending}
                          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
                        >
                          {reject.isPending ? "Rejecting..." : "Confirm rejection"}
                        </button>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
                  {order.dispute.state === "open"
                    ? "This order has an open dispute, so payout release is locked until admin resolves it."
                    : "This order has already moved past the seller verification stage."}
                </div>
              )}
            </section>

            <section className="rounded-[24px] border bg-card p-5">
              <h2 className="text-lg font-semibold">Seller Guidance</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Verification triggers settlement</p>
                    <p className="text-sm text-muted-foreground">
                      Only verify when the buyer’s proof matches the service you promised in the listing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Reject with specifics</p>
                    <p className="text-sm text-muted-foreground">
                      Clear rejection reasons help buyers, admins, and future dispute decisions.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
