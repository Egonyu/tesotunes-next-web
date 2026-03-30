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
  MessageSquare,
  ShieldCheck,
  Star,
  Upload,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { ReviewComposer } from "@/components/reviews/review-composer";
import {
  useDisputeOrder,
  useMyPurchase,
  useReviewPromotion,
  useSubmitVerification,
} from "@/hooks/usePromotions";
import { OrderStatusBadge } from "@/components/promotions";
import { getPromotionProofGuide } from "@/lib/promotions-proof";
import {
  DISPUTE_REASON_LABELS,
  type DisputeReasonCode,
} from "@/types/promotions";

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

export default function PurchaseDetailPage() {
  const params = useParams();
  const orderId = Number(params.orderId);
  const { data: order, isLoading } = useMyPurchase(orderId);

  const submitVerification = useSubmitVerification(orderId);
  const disputeOrder = useDisputeOrder(orderId);
  const reviewPromotion = useReviewPromotion(orderId);

  const [verificationUrl, setVerificationUrl] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const [disputeReason, setDisputeReason] = useState("");
  const [disputeReasonCode, setDisputeReasonCode] =
    useState<DisputeReasonCode>("missing_delivery");
  const [disputeEvidenceUrl, setDisputeEvidenceUrl] = useState("");
  const [disputeEvidenceFiles, setDisputeEvidenceFiles] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const timeline = useMemo(() => {
    if (!order) return [];

    return [
      {
        label: "Purchased",
        done: true,
        date: order.created_at,
      },
      {
        label: "Verification Submitted",
        done:
          order.verification.status === "submitted" ||
          order.verification.status === "verified",
        date: order.verification.submitted_at,
      },
      {
        label: "Completed",
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
          href="/promotions/purchases"
          className="mt-3 inline-block text-sm text-primary underline"
        >
          Back to purchases
        </Link>
      </div>
    );
  }

  const canSubmitVerification =
    order.status === "pending_verification" &&
    order.verification.status === "pending";
  const canDispute =
    (order.status === "pending_verification" ||
      order.status === "verification_submitted") &&
    !order.dispute.is_disputed;
  const canReview = order.status === "completed";
  const proofGuide = getPromotionProofGuide(order.promotion.platform, order.promotion.type);

  const handleSubmitVerification = () => {
    submitVerification.mutate(
      {
        verification_url: verificationUrl,
        verification_notes: verificationNotes || undefined,
      },
      { onSuccess: () => setShowVerificationForm(false) }
    );
  };

  const handleDispute = () => {
    disputeOrder.mutate(
      {
        reason: disputeReason,
        reason_code: disputeReasonCode,
        evidence_url: disputeEvidenceUrl || undefined,
        evidence_files: disputeEvidenceFiles
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setShowDisputeForm(false);
          setDisputeReasonCode("missing_delivery");
          setDisputeEvidenceUrl("");
          setDisputeEvidenceFiles("");
        },
      }
    );
  };

  const handleReview = ({
    rating,
    comment,
    wouldRecommend,
  }: {
    rating: number;
    comment: string;
    wouldRecommend: boolean;
  }) => {
    reviewPromotion.mutate(
      { rating, comment, would_recommend: wouldRecommend },
      { onSuccess: () => setShowReviewForm(false) }
    );
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-8">
        <Link
          href="/promotions/purchases"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Purchases
        </Link>

        <section className="rounded-[28px] border bg-card p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px]">
            <div className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Promotion Order
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
                    <p className="font-semibold">{order.promotion.promoter.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{order.promotion.promoter.username}
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
                label="Payment"
                value={order.payment_method.toUpperCase()}
                note="Selected checkout method"
              />
              <Stat
                label="Expected Delivery"
                value={formatDate(order.expected_delivery_at)}
                note="Marketplace estimate"
              />
              <Stat
                label="Credits"
                value={formatNumber(order.total_credits)}
                note="Promotion credits charged"
              />
              <Stat
                label="UGX"
                value={formatCurrency(order.total_ugx)}
                note="Cash portion of the order"
              />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_380px]">
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border bg-card p-5">
                <h2 className="text-lg font-semibold">Order Details</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Purchased</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Payment status</span>
                    <span className="capitalize">{order.payment_status}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Credits amount</span>
                    <span>{formatNumber(order.total_credits)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">UGX amount</span>
                    <span>{formatCurrency(order.total_ugx)}</span>
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
                <h2 className="text-lg font-semibold">Verification</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Status</span>
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
                  {order.verification.verified_at && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Verified</span>
                      <span>{formatDate(order.verification.verified_at)}</span>
                    </div>
                  )}
                  {order.verification.verification_url && (
                    <a
                      href={order.verification.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      View proof
                      <ExternalLink className="h-4 w-4" />
                    </a>
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
                        Rejection Reason
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
                  {proofGuide.buyerPrompt}
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
                <h2 className="text-lg font-semibold">What verification checks</h2>
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

            {order.song && (
              <section className="rounded-[24px] border bg-card p-5">
                <h2 className="text-lg font-semibold">Promoted Song</h2>
                <div className="mt-4 flex items-center gap-3">
                  {order.song.artwork_url && (
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={order.song.artwork_url}
                        alt={order.song.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{order.song.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {order.song.artist.name}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {order.dispute.is_disputed && (
              <section className="rounded-[24px] border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h2 className="text-lg font-semibold">Dispute Record</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {order.dispute.reason || order.dispute.dispute_reason}
                </p>
                {order.dispute.reason_code ? (
                  <div className="mt-3 inline-flex rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80">
                    {DISPUTE_REASON_LABELS[order.dispute.reason_code]}
                  </div>
                ) : null}
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
                {order.dispute.evidence_url && (
                  <a
                    href={order.dispute.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Open dispute evidence
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {order.dispute.evidence_files?.length ? (
                  <div className="mt-4 rounded-2xl border bg-background/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Supporting files
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
                {order.dispute.resolution && (
                  <div className="mt-4 rounded-2xl border bg-background/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Resolution
                    </p>
                    <p className="mt-2 text-sm capitalize">
                      {order.dispute.resolution.replace(/_/g, " ")}
                    </p>
                    {order.dispute.resolution_notes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {order.dispute.resolution_notes}
                      </p>
                    )}
                    {order.dispute.refund_reason &&
                    order.dispute.resolution === "refund_buyer" ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Refund reason: {order.dispute.refund_reason}
                      </p>
                    ) : null}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <section className="rounded-[24px] border bg-card p-5">
                <h2 className="text-lg font-semibold">Next Best Action</h2>
                <div className="mt-4 space-y-3">
                  {canSubmitVerification && !showVerificationForm && (
                    <button
                      onClick={() => setShowVerificationForm(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4" />
                      Submit Verification
                    </button>
                  )}
                  {canDispute && !showDisputeForm && (
                    <button
                      onClick={() => setShowDisputeForm(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Raise Dispute
                    </button>
                  )}
                  {canReview && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted"
                    >
                      <Star className="h-4 w-4" />
                      Leave Review
                    </button>
                  )}

                  {!canSubmitVerification && !canDispute && !canReview && (
                    <div className="rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
                      This order is currently waiting on the next marketplace state change.
                    </div>
                  )}
                </div>

                {showVerificationForm && (
                  <div className="mt-4 space-y-3 rounded-2xl border bg-background/70 p-4">
                    <h3 className="font-medium">Submit verification proof</h3>
                    <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
                      {proofGuide.buyerPrompt}
                    </div>
                    <input
                      type="url"
                      value={verificationUrl}
                      onChange={(e) => setVerificationUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add context or proof notes..."
                      rows={3}
                      className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitVerification}
                        disabled={!verificationUrl || submitVerification.isPending}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                      >
                        {submitVerification.isPending ? "Submitting..." : "Submit"}
                      </button>
                      <button
                        onClick={() => setShowVerificationForm(false)}
                        className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showDisputeForm && (
                  <div className="mt-4 space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                    <h3 className="font-medium text-destructive">File dispute</h3>
                    <select
                      value={disputeReasonCode}
                      onChange={(e) =>
                        setDisputeReasonCode(e.target.value as DisputeReasonCode)
                      }
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                    >
                      {Object.entries(DISPUTE_REASON_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Describe the problem with this promotion delivery..."
                      rows={4}
                      className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      value={disputeEvidenceUrl}
                      onChange={(e) => setDisputeEvidenceUrl(e.target.value)}
                      placeholder="Evidence URL (optional)"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={disputeEvidenceFiles}
                      onChange={(e) => setDisputeEvidenceFiles(e.target.value)}
                      placeholder="Optional supporting file URLs, comma separated"
                      rows={3}
                      className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDispute}
                        disabled={!disputeReason || disputeOrder.isPending}
                        className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
                      >
                        {disputeOrder.isPending ? "Submitting..." : "Submit dispute"}
                      </button>
                      <button
                        onClick={() => setShowDisputeForm(false)}
                        className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showReviewForm && (
                  <div className="mt-4">
                    <ReviewComposer
                      title="Leave review"
                      description="Share your experience with this promoter."
                      submitLabel={reviewPromotion.isPending ? "Submitting..." : "Submit review"}
                      disabled={reviewPromotion.isPending}
                      onSubmit={handleReview}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}
              </section>

              <section className="rounded-[24px] border bg-card p-5">
                <h2 className="text-lg font-semibold">Marketplace Safety</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">Escrow flow</p>
                      <p className="text-sm text-muted-foreground">
                        Funds are protected until proof is submitted and delivery is reviewed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-0.5 h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Dispute support</p>
                      <p className="text-sm text-muted-foreground">
                        If delivery misses the agreed scope, you can escalate here for resolution.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Time-bound processing</p>
                      <p className="text-sm text-muted-foreground">
                        Verification and dispute status updates flow back into the admin marketplace queue.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
