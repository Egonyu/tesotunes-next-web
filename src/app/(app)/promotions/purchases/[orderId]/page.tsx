"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Star,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  useMyPurchase,
  useSubmitVerification,
  useDisputeOrder,
  useReviewPromotion,
} from "@/hooks/usePromotions";
import { OrderStatusBadge } from "@/components/promotions";

export default function PurchaseDetailPage() {
  const params = useParams();
  const orderId = Number(params.orderId);
  const { data: order, isLoading } = useMyPurchase(orderId);

  const submitVerification = useSubmitVerification(orderId);
  const disputeOrder = useDisputeOrder(orderId);
  const reviewPromotion = useReviewPromotion(orderId);

  // Verification form
  const [verificationUrl, setVerificationUrl] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  // Dispute form
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  // Review form
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <Link
          href="/promotions/purchases"
          className="text-primary underline text-sm"
        >
          Back to purchases
        </Link>
      </div>
    );
  }

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
      { reason: disputeReason },
      { onSuccess: () => setShowDisputeForm(false) }
    );
  };

  const handleReview = () => {
    reviewPromotion.mutate(
      { rating, comment: reviewComment, would_recommend: wouldRecommend },
      { onSuccess: () => setShowReviewForm(false) }
    );
  };

  // Timeline steps
  const steps = [
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/promotions/purchases"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Purchases
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{order.promotion.title}</h1>
          <p className="text-sm text-muted-foreground font-mono">
            {order.order_number}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
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
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8",
                  step.done ? "bg-emerald-400" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order info */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h3 className="font-semibold">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{order.payment_method}</span>
            </div>
            {order.total_credits > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">{order.total_credits}</span>
              </div>
            )}
            {order.total_ugx > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">UGX</span>
                <span className="font-medium">
                  {formatCurrency(order.total_ugx)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Delivery</span>
              <span>{formatDate(order.expected_delivery_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchased</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Verification status */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h3 className="font-semibold">Verification</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">
                {order.verification.status.replace("_", " ")}
              </span>
            </div>
            {order.verification.verification_url && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Proof URL</span>
                <a
                  href={order.verification.verification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-1 text-xs"
                >
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {order.verification.verification_notes && (
              <div>
                <span className="text-muted-foreground block mb-1">Notes</span>
                <p className="text-xs bg-muted/50 rounded p-2">
                  {order.verification.verification_notes}
                </p>
              </div>
            )}
            {order.verification.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded p-3">
                <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                  Rejection Reason:
                </span>
                <p className="text-xs mt-1">
                  {order.verification.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Song info */}
      {order.song && (
        <div className="bg-card border rounded-lg p-5">
          <h3 className="font-semibold mb-3">Promoted Song</h3>
          <div className="flex items-center gap-3">
            {order.song.artwork_url && (
              <div className="h-12 w-12 rounded bg-muted overflow-hidden relative shrink-0">
                <img
                  src={order.song.artwork_url}
                  alt={order.song.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{order.song.title}</p>
              <p className="text-xs text-muted-foreground">
                by {order.song.artist.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        {/* Submit Verification */}
        {order.status === "pending_verification" &&
          order.verification.status === "pending" && (
            <>
              {!showVerificationForm ? (
                <button
                  onClick={() => setShowVerificationForm(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Submit Verification
                </button>
              ) : (
                <div className="bg-card border rounded-lg p-5 space-y-4">
                  <h3 className="font-semibold">Submit Verification Proof</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Verification URL *
                      </label>
                      <input
                        type="url"
                        value={verificationUrl}
                        onChange={(e) => setVerificationUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Notes
                      </label>
                      <textarea
                        value={verificationNotes}
                        onChange={(e) =>
                          setVerificationNotes(e.target.value)
                        }
                        placeholder="Additional context..."
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitVerification}
                        disabled={
                          !verificationUrl || submitVerification.isPending
                        }
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
                      >
                        {submitVerification.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Submit
                      </button>
                      <button
                        onClick={() => setShowVerificationForm(false)}
                        className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        {/* Dispute */}
        {(order.status === "pending_verification" ||
          order.status === "verification_submitted") &&
          !order.dispute.is_disputed && (
            <>
              {!showDisputeForm ? (
                <button
                  onClick={() => setShowDisputeForm(true)}
                  className="flex items-center gap-2 border border-destructive text-destructive px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/10 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Dispute Order
                </button>
              ) : (
                <div className="bg-card border border-destructive/30 rounded-lg p-5 space-y-4">
                  <h3 className="font-semibold text-destructive">
                    File a Dispute
                  </h3>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Reason *
                    </label>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Describe the issue..."
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-destructive/20 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDispute}
                      disabled={
                        !disputeReason || disputeOrder.isPending
                      }
                      className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90 disabled:opacity-60 flex items-center gap-2"
                    >
                      {disputeOrder.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Submit Dispute
                    </button>
                    <button
                      onClick={() => setShowDisputeForm(false)}
                      className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        {/* Review */}
        {order.status === "completed" && (
          <>
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                <Star className="h-4 w-4" />
                Leave a Review
              </button>
            ) : (
              <div className="bg-card border rounded-lg p-5 space-y-4">
                <h3 className="font-semibold">Leave a Review</h3>
                <div className="space-y-3">
                  {/* Star rating */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Rating
                    </label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setRating(s)}
                          className="p-0.5"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6",
                              s <= rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Comment
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wouldRecommend}
                      onChange={(e) =>
                        setWouldRecommend(e.target.checked)
                      }
                      className="rounded"
                    />
                    I would recommend this promoter
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReview}
                      disabled={
                        !reviewComment || reviewPromotion.isPending
                      }
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
                    >
                      {reviewPromotion.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Submit Review
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
