"use client";

import Image from "next/image";
import { Loader2, MessageSquare, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ReviewRatingDisplay } from "@/components/reviews/review-rating-input";

export interface ReviewFeedItem {
  id: number | string;
  reviewerName: string;
  reviewerAvatarUrl?: string | null;
  reviewerVerified?: boolean;
  contextLabel?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount?: number;
  isHelpfulMarked?: boolean | null;
  wouldRecommend?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  sellerResponse?: string | null;
  sellerResponseAt?: string | null;
}

interface ReviewFeedProps {
  reviews: ReviewFeedItem[];
  emptyMessage?: string;
  onMarkHelpful?: (reviewId: number | string, helpful: boolean) => void;
  markingHelpfulId?: number | string | null;
  onEdit?: (reviewId: number | string) => void;
  onDelete?: (reviewId: number | string) => void;
  deletingReviewId?: number | string | null;
}

export function ReviewFeed({
  reviews,
  emptyMessage = "No reviews yet.",
  onMarkHelpful,
  markingHelpfulId,
  onEdit,
  onDelete,
  deletingReviewId,
}: ReviewFeedProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-2xl border bg-background/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                {review.reviewerAvatarUrl ? (
                  <Image
                    src={review.reviewerAvatarUrl}
                    alt={review.reviewerName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-semibold text-primary">
                    {review.reviewerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{review.reviewerName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
                {review.contextLabel ? (
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {review.contextLabel}
                  </p>
                ) : null}
              </div>
            </div>
            <ReviewRatingDisplay value={review.rating} />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {review.wouldRecommend ? (
              <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Would recommend
              </span>
            ) : null}
            {typeof review.helpfulCount === "number" ? (
              onMarkHelpful ? (
                <button
                  type="button"
                  onClick={() => onMarkHelpful(review.id, review.isHelpfulMarked !== true)}
                  disabled={markingHelpfulId === review.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition",
                    review.isHelpfulMarked
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {markingHelpfulId === review.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ThumbsUp className="h-3.5 w-3.5" />
                  )}
                  Helpful ({review.helpfulCount})
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {review.helpfulCount} found this helpful
                </span>
              )
            ) : null}
            {review.canEdit && onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(review.id)}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/80"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : null}
            {review.canDelete && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                disabled={deletingReviewId === review.id}
                className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/15 disabled:opacity-60"
              >
                {deletingReviewId === review.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>
            ) : null}
          </div>

          {review.sellerResponse ? (
            <div className="mt-4 rounded-2xl border bg-card p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Seller response
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{review.sellerResponse}</p>
              {review.sellerResponseAt ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(review.sellerResponseAt)}
                </p>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
