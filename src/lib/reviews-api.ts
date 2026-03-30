import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import type {
  CreateReviewRequest,
  PaginatedReviewsResponse,
  ReviewMutationResponse,
  ReviewableType,
  UpdateReviewRequest,
} from "@/types/reviews";

export function fetchReviews(reviewableType: ReviewableType, reviewableId: number, page = 1) {
  return apiGet<PaginatedReviewsResponse>(`/reviews/${reviewableType}/${reviewableId}?page=${page}`);
}

export function createReview(data: CreateReviewRequest) {
  return apiPost<ReviewMutationResponse>("/reviews", data);
}

export function updateReview(id: number, data: UpdateReviewRequest) {
  return apiPut<ReviewMutationResponse>(`/reviews/${id}`, data);
}

export function deleteReview(id: number) {
  return apiDelete<{ success: boolean; message: string }>(`/reviews/${id}`);
}

export function markReviewHelpful(id: number, helpful: boolean) {
  return apiPost<ReviewMutationResponse>(`/reviews/${id}/helpful`, { helpful });
}
