import type { ReviewFeedItem } from "@/components/reviews/review-feed";
import type { ReviewItem } from "@/types/reviews";
import type { PromotionReview } from "@/types/promotions";

export function mapGenericReviewToFeedItem(
  review: ReviewItem,
  options?: {
    contextLabel?: string | null;
    idPrefix?: string;
  }
): ReviewFeedItem {
  const prefix = options?.idPrefix ? `${options.idPrefix}:` : "";

  return {
    id: `${prefix}${review.id}`,
    reviewerName: review.user?.name ?? "Tesotunes user",
    reviewerAvatarUrl: review.user?.avatar_url ?? null,
    reviewerVerified: review.user?.is_verified ?? false,
    contextLabel: options?.contextLabel ?? null,
    rating: review.rating,
    comment: review.content,
    createdAt: review.created_at ?? new Date().toISOString(),
    helpfulCount: review.helpful_count,
    isHelpfulMarked: review.is_helpful_marked,
    wouldRecommend: Boolean(review.metadata?.would_recommend),
    canEdit: review.can_edit,
    canDelete: review.can_delete,
    sellerResponse: review.seller_response,
    sellerResponseAt: review.seller_response_at,
  };
}

export function mapPromotionReviewToFeedItem(
  review: PromotionReview,
  options?: {
    contextLabel?: string | null;
    idPrefix?: string;
  }
): ReviewFeedItem {
  const prefix = options?.idPrefix ? `${options.idPrefix}:` : "";

  return {
    id: `${prefix}${review.id}`,
    reviewerName: review.reviewer.name,
    reviewerAvatarUrl: review.reviewer.avatar_url,
    reviewerVerified: review.reviewer.is_verified,
    contextLabel: options?.contextLabel ?? null,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    helpfulCount: review.helpful_count,
    wouldRecommend: review.would_recommend,
  };
}
