"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/lib/reviews-api";
import type {
  CreateReviewRequest,
  ReviewableType,
  UpdateReviewRequest,
} from "@/types/reviews";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (reviewableType: ReviewableType, reviewableId: number, page: number) =>
    [...reviewKeys.all, "list", reviewableType, reviewableId, page] as const,
};

export function useReviews(reviewableType: ReviewableType, reviewableId: number, page = 1) {
  return useQuery({
    queryKey: reviewKeys.list(reviewableType, reviewableId, page),
    queryFn: () => api.fetchReviews(reviewableType, reviewableId, page),
    enabled: Boolean(reviewableType && reviewableId > 0),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => api.createReview(data),
    onSuccess: (_response, variables) => {
      toast.success("Review saved.");
      qc.invalidateQueries({
        queryKey: reviewKeys.list(variables.reviewable_type, variables.reviewable_id, 1),
      });
    },
    onError: () => {
      toast.error("Failed to save review.");
    },
  });
}

export function useUpdateReview(reviewableType: ReviewableType, reviewableId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReviewRequest }) =>
      api.updateReview(id, data),
    onSuccess: () => {
      toast.success("Review updated.");
      qc.invalidateQueries({ queryKey: reviewKeys.list(reviewableType, reviewableId, 1) });
    },
    onError: () => {
      toast.error("Failed to update review.");
    },
  });
}

export function useDeleteReview(reviewableType: ReviewableType, reviewableId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteReview(id),
    onSuccess: () => {
      toast.success("Review deleted.");
      qc.invalidateQueries({ queryKey: reviewKeys.list(reviewableType, reviewableId, 1) });
    },
    onError: () => {
      toast.error("Failed to delete review.");
    },
  });
}

export function useMarkReviewHelpful(reviewableType: ReviewableType, reviewableId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, helpful }: { id: number; helpful: boolean }) =>
      api.markReviewHelpful(id, helpful),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(reviewableType, reviewableId, 1) });
    },
    onError: () => {
      toast.error("Failed to save review feedback.");
    },
  });
}
