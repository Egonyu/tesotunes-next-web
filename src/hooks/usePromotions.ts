// ============================================================================
// TesoTunes Promotions Module - React Query Hooks
// All server-state hooks for the Promotion Campaigns marketplace
// ============================================================================

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  BrowsePromotionsParams,
  PurchasePromotionRequest,
  SubmitVerificationRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  DisputeOrderRequest,
  ReviewPromotionRequest,
  VerifyOrderRequest,
  RejectOrderRequest,
  ResolveDisputeRequest,
} from "@/types/promotions";
import * as api from "@/lib/promotions-api";

// ---------------------------------------------------------------------------
// Query Keys (centralised for cache invalidation)
// ---------------------------------------------------------------------------

export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (params: BrowsePromotionsParams) =>
    [...promotionKeys.lists(), params] as const,
  detail: (slug: string) => [...promotionKeys.all, "detail", slug] as const,
  reviews: (slug: string, page: number) =>
    [...promotionKeys.all, "reviews", slug, page] as const,
  platforms: () => [...promotionKeys.all, "platforms"] as const,
  promoter: (username: string) =>
    [...promotionKeys.all, "promoter", username] as const,

  // Buyer
  myPurchases: (params?: Record<string, unknown>) =>
    [...promotionKeys.all, "my-purchases", params] as const,
  myPurchase: (id: number) =>
    [...promotionKeys.all, "my-purchase", id] as const,

  // Seller
  myPromotions: (params?: Record<string, unknown>) =>
    [...promotionKeys.all, "my-promotions", params] as const,
  myOrders: (params?: Record<string, unknown>) =>
    [...promotionKeys.all, "my-orders", params] as const,
  myOrder: (id: number) =>
    [...promotionKeys.all, "my-order", id] as const,
  sellerAnalytics: () =>
    [...promotionKeys.all, "seller-analytics"] as const,

  // Admin
  adminList: (params?: Record<string, unknown>) =>
    [...promotionKeys.all, "admin-list", params] as const,
  adminDisputes: (params?: Record<string, unknown>) =>
    [...promotionKeys.all, "admin-disputes", params] as const,
  adminAnalytics: () =>
    [...promotionKeys.all, "admin-analytics"] as const,
};

// ---------------------------------------------------------------------------
// PUBLIC HOOKS
// ---------------------------------------------------------------------------

/** Browse promotions with filters & pagination */
export function usePromotions(params: BrowsePromotionsParams = {}) {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: () => api.fetchPromotions(params),
    placeholderData: (prev) => prev,
  });
}

/** Single promotion detail */
export function usePromotion(slug: string) {
  return useQuery({
    queryKey: promotionKeys.detail(slug),
    queryFn: () => api.fetchPromotion(slug).then((r) => r.data),
    enabled: !!slug,
  });
}

/** Promotion reviews (paginated) */
export function usePromotionReviews(slug: string, page = 1) {
  return useQuery({
    queryKey: promotionKeys.reviews(slug, page),
    queryFn: () => api.fetchPromotionReviews(slug, page),
    enabled: !!slug,
  });
}

/** Available platforms */
export function usePlatforms() {
  return useQuery({
    queryKey: promotionKeys.platforms(),
    queryFn: () => api.fetchPlatforms().then((r) => r.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/** Promoter profile */
export function usePromoterProfile(username: string) {
  return useQuery({
    queryKey: promotionKeys.promoter(username),
    queryFn: () => api.fetchPromoterProfile(username).then((r) => r.data),
    enabled: !!username,
  });
}

// ---------------------------------------------------------------------------
// BUYER HOOKS
// ---------------------------------------------------------------------------

/** Purchase a promotion */
export function usePurchasePromotion(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchasePromotionRequest) =>
      api.purchasePromotion(slug, data),
    onSuccess: () => {
      toast.success("Promotion purchased successfully!");
      qc.invalidateQueries({ queryKey: promotionKeys.myPurchases() });
    },
    onError: () => {
      toast.error("Failed to purchase promotion. Please try again.");
    },
  });
}

/** My purchases */
export function useMyPurchases(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: promotionKeys.myPurchases(params),
    queryFn: () => api.fetchMyPurchases(params),
  });
}

/** Single purchase detail */
export function useMyPurchase(orderId: number) {
  return useQuery({
    queryKey: promotionKeys.myPurchase(orderId),
    queryFn: () => api.fetchMyPurchase(orderId).then((r) => r.data),
    enabled: orderId > 0,
  });
}

/** Submit verification */
export function useSubmitVerification(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitVerificationRequest) =>
      api.submitVerification(orderId, data),
    onSuccess: () => {
      toast.success("Verification submitted!");
      qc.invalidateQueries({ queryKey: promotionKeys.myPurchase(orderId) });
      qc.invalidateQueries({ queryKey: promotionKeys.myPurchases() });
    },
    onError: () => {
      toast.error("Failed to submit verification.");
    },
  });
}

/** Dispute an order */
export function useDisputeOrder(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DisputeOrderRequest) =>
      api.disputeOrder(orderId, data),
    onSuccess: () => {
      toast.success("Dispute filed successfully.");
      qc.invalidateQueries({ queryKey: promotionKeys.myPurchase(orderId) });
      qc.invalidateQueries({ queryKey: promotionKeys.myPurchases() });
    },
    onError: () => {
      toast.error("Failed to file dispute.");
    },
  });
}

/** Review a promotion */
export function useReviewPromotion(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewPromotionRequest) =>
      api.reviewPromotion(orderId, data),
    onSuccess: () => {
      toast.success("Review submitted! Thank you.");
      qc.invalidateQueries({ queryKey: promotionKeys.myPurchase(orderId) });
    },
    onError: () => {
      toast.error("Failed to submit review.");
    },
  });
}

// ---------------------------------------------------------------------------
// SELLER HOOKS
// ---------------------------------------------------------------------------

/** Create a new promotion */
export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: promotionKeys.myPromotions(), // Added mutationKey for cache tracking
    mutationFn: (data: CreatePromotionRequest) =>
      api.createPromotion(data),
    onSuccess: () => {
      toast.success("Promotion created! Pending admin approval.");
      qc.invalidateQueries({ queryKey: promotionKeys.myPromotions() });
    },
    onError: () => {
      toast.error("Failed to create promotion.");
    },
  });
}

/** Update promotion */
export function useUpdatePromotion(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePromotionRequest) =>
      api.updatePromotion(id, data),
    onSuccess: () => {
      toast.success("Promotion updated!");
      qc.invalidateQueries({ queryKey: promotionKeys.myPromotions() });
    },
    onError: () => {
      toast.error("Failed to update promotion.");
    },
  });
}

/** Delete promotion */
export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deletePromotion(id),
    onSuccess: () => {
      toast.success("Promotion deleted.");
      qc.invalidateQueries({ queryKey: promotionKeys.myPromotions() });
    },
    onError: () => {
      toast.error("Failed to delete promotion.");
    },
  });
}

/** Pause promotion */
export function usePausePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.pausePromotion(id),
    onSuccess: () => {
      toast.success("Promotion paused.");
      qc.invalidateQueries({ queryKey: promotionKeys.myPromotions() });
    },
  });
}

/** Activate promotion */
export function useActivatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.activatePromotion(id),
    onSuccess: () => {
      toast.success("Promotion activated!");
      qc.invalidateQueries({ queryKey: promotionKeys.myPromotions() });
    },
  });
}

/** My promotions (seller) */
export function useMyPromotions(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: promotionKeys.myPromotions(params),
    queryFn: () => api.fetchMyPromotions(params),
  });
}

/** Orders for my promotions */
export function useMyPromotionOrders(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: promotionKeys.myOrders(params),
    queryFn: () => api.fetchMyPromotionOrders(params),
  });
}

/** Single order detail (seller) */
export function useMyPromotionOrder(orderId: number) {
  return useQuery({
    queryKey: promotionKeys.myOrder(orderId),
    queryFn: () => api.fetchMyPromotionOrder(orderId).then((r) => r.data),
    enabled: orderId > 0,
  });
}

/** Verify order (seller) */
export function useVerifyOrder(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VerifyOrderRequest) =>
      api.verifyOrder(orderId, data),
    onSuccess: () => {
      toast.success("Order verified! Payment released.");
      qc.invalidateQueries({ queryKey: promotionKeys.myOrders() });
      qc.invalidateQueries({ queryKey: promotionKeys.myOrder(orderId) });
      qc.invalidateQueries({ queryKey: promotionKeys.sellerAnalytics() });
    },
    onError: () => {
      toast.error("Failed to verify order.");
    },
  });
}

/** Reject order (seller) */
export function useRejectOrder(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RejectOrderRequest) =>
      api.rejectOrder(orderId, data),
    onSuccess: () => {
      toast.success("Order rejected. Refund issued to buyer.");
      qc.invalidateQueries({ queryKey: promotionKeys.myOrders() });
      qc.invalidateQueries({ queryKey: promotionKeys.myOrder(orderId) });
    },
    onError: () => {
      toast.error("Failed to reject order.");
    },
  });
}

/** Seller analytics */
export function useSellerAnalytics() {
  return useQuery({
    queryKey: promotionKeys.sellerAnalytics(),
    queryFn: () => api.fetchSellerAnalytics().then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// ADMIN HOOKS
// ---------------------------------------------------------------------------

/** Admin promotions list */
export function useAdminPromotions(params: { status?: string; page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: promotionKeys.adminList(params),
    queryFn: () => api.adminFetchPromotions(params),
  });
}

/** Approve promotion */
export function useAdminApprovePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.adminApprovePromotion(id),
    onSuccess: () => {
      toast.success("Promotion approved!");
      qc.invalidateQueries({ queryKey: promotionKeys.adminList() });
    },
    onError: () => {
      toast.error("Failed to approve promotion.");
    },
  });
}

/** Reject promotion */
export function useAdminRejectPromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.adminRejectPromotion(id, { reason }),
    onSuccess: () => {
      toast.success("Promotion rejected.");
      qc.invalidateQueries({ queryKey: promotionKeys.adminList() });
    },
    onError: () => {
      toast.error("Failed to reject promotion.");
    },
  });
}

/** Disputed orders */
export function useAdminDisputes(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: promotionKeys.adminDisputes(params),
    queryFn: () => api.adminFetchDisputes(params),
  });
}

/** Resolve dispute */
export function useAdminResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      disputeId,
      data,
    }: {
      disputeId: number;
      data: ResolveDisputeRequest;
    }) => api.adminResolveDispute(disputeId, data),
    onSuccess: () => {
      toast.success("Dispute resolved.");
      qc.invalidateQueries({ queryKey: promotionKeys.adminDisputes() });
    },
    onError: () => {
      toast.error("Failed to resolve dispute.");
    },
  });
}

/** Admin analytics */
export function useAdminAnalytics() {
  return useQuery({
    queryKey: promotionKeys.adminAnalytics(),
    queryFn: () => api.adminFetchAnalytics().then((r) => r.data),
  });
}
