// ============================================================================
// TesoTunes Promotions Module - API Layer
// Dedicated API client for the Promotion Campaigns marketplace
// ============================================================================

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type {
  Promotion,
  PromotionListItem,
  PromotionOrder,
  PromoterProfile,
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
  UpdatePromoterProfileRequest,
  PaginatedPromotions,
  PaginatedOrders,
  PaginatedReviews,
  PurchaseResponse,
  SellerAnalytics,
  AdminAnalytics,
  PromotionPlatform,
} from "@/types/promotions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// PUBLIC (No Auth)
// ---------------------------------------------------------------------------

/** Browse / discover promotions with filters */
export function fetchPromotions(params: BrowsePromotionsParams = {}) {
  return apiGet<PaginatedPromotions>(
    `/promotions${toQueryString(params as Record<string, unknown>)}`
  );
}

/** Get single promotion detail by slug */
export function fetchPromotion(slug: string) {
  return apiGet<{ data: Promotion }>(`/promotions/${slug}`);
}

/** Get available platforms list */
export function fetchPlatforms() {
  return apiGet<{ data: { slug: PromotionPlatform; name: string; icon_url: string | null }[] }>(
    "/promotions/platforms/list"
  );
}

/** Get promoter public profile */
export function fetchPromoterProfile(username: string) {
  return apiGet<{ data: PromoterProfile }>(`/promoters/${username}`);
}

// ---------------------------------------------------------------------------
// BUYER (Auth Required)
// ---------------------------------------------------------------------------

/** Purchase a promotion */
export function purchasePromotion(slug: string, data: PurchasePromotionRequest) {
  return apiPost<PurchaseResponse>(`/promotions/${slug}/purchase`, data);
}

/** List my promotion purchases */
export function fetchMyPurchases(params: { status?: string; page?: number } = {}) {
  return apiGet<PaginatedOrders>(
    `/my/promotions/purchases${toQueryString(params as Record<string, unknown>)}`
  );
}

/** Get single purchase order detail */
export function fetchMyPurchase(orderId: number) {
  return apiGet<{ data: PromotionOrder }>(`/my/promotions/purchases/${orderId}`);
}

/** Submit verification proof for an order */
export function submitVerification(orderId: number, data: SubmitVerificationRequest) {
  return apiPost<{ success: boolean; message: string }>(
    `/promotions/orders/${orderId}/submit-verification`,
    data
  );
}

/** Dispute an order */
export function disputeOrder(orderId: number, data: DisputeOrderRequest) {
  return apiPost<{ success: boolean; dispute_id: number }>(
    `/promotions/orders/${orderId}/dispute`,
    data
  );
}

/** Leave a review for a completed order */
export function reviewPromotion(orderId: number, data: ReviewPromotionRequest) {
  return apiPost<{ success: boolean; review_id: number }>(
    `/promotions/orders/${orderId}/review`,
    data
  );
}

// ---------------------------------------------------------------------------
// SELLER / PROMOTER (Auth Required)
// ---------------------------------------------------------------------------

/** Create a new promotion listing */
export function createPromotion(data: CreatePromotionRequest) {
  return apiPost<{ promotion: Promotion }>("/promotions", data);
}

/** Update an existing promotion */
export function updatePromotion(id: number, data: UpdatePromotionRequest) {
  return apiPut<{ promotion: Promotion }>(`/promotions/${id}`, data);
}

/** Delete / archive a promotion */
export function deletePromotion(id: number) {
  return apiDelete<{ success: boolean }>(`/promotions/${id}`);
}

/** Pause a promotion (stop accepting orders) */
export function pausePromotion(id: number) {
  return apiPost<{ success: boolean; status: string }>(`/promotions/${id}/pause`);
}

/** Activate / reactivate a paused promotion */
export function activatePromotion(id: number) {
  return apiPost<{ success: boolean; status: string }>(`/promotions/${id}/activate`);
}

/** List my promotions (seller view) */
export function fetchMyPromotions(params: { status?: string; page?: number } = {}) {
  return apiGet<PaginatedPromotions>(
    `/my/promotions${toQueryString(params as Record<string, unknown>)}`
  );
}

/** Get single promotion detail for the current seller */
export function fetchMyPromotion(id: number) {
  return apiGet<{ data: Promotion }>(`/my/promotions/${id}`);
}

/** Get the current seller's promoter profile */
export function fetchMyPromoterProfile() {
  return apiGet<{ data: PromoterProfile }>("/my/promoter-profile");
}

/** Update the current seller's promoter profile */
export function updateMyPromoterProfile(data: UpdatePromoterProfileRequest) {
  return apiPut<{ data: PromoterProfile }>("/my/promoter-profile", data);
}

/** List orders for my promotions (seller verification queue) */
export function fetchMyPromotionOrders(params: { status?: string; page?: number } = {}) {
  return apiGet<PaginatedOrders>(
    `/my/promotions/orders${toQueryString(params as Record<string, unknown>)}`
  );
}

/** Get seller order detail */
export function fetchMyPromotionOrder(orderId: number) {
  return apiGet<{ data: PromotionOrder }>(`/my/promotions/orders/${orderId}`);
}

/** Verify an order (seller approves) */
export function verifyOrder(orderId: number, data: VerifyOrderRequest) {
  return apiPost<{ success: boolean; payment_released: boolean }>(
    `/promotions/orders/${orderId}/verify`,
    data
  );
}

/** Reject verification (triggers refund) */
export function rejectOrder(orderId: number, data: RejectOrderRequest) {
  return apiPost<{ success: boolean; refund_issued: boolean }>(
    `/promotions/orders/${orderId}/reject`,
    data
  );
}

/** Seller analytics */
export function fetchSellerAnalytics() {
  return apiGet<{ data: SellerAnalytics }>("/my/promotions/analytics");
}

// ---------------------------------------------------------------------------
// ADMIN (Auth + Admin Role)
// ---------------------------------------------------------------------------

/** List all promotions (admin view) */
export function adminFetchPromotions(params: { status?: string; page?: number; search?: string } = {}) {
  return apiGet<PaginatedPromotions>(
    `/admin/promotions${toQueryString(params as Record<string, unknown>)}`
  );
}

/** Approve a pending promotion */
export function adminApprovePromotion(id: number) {
  return apiPost<{ success: boolean; status: string }>(`/admin/promotions/${id}/approve`);
}

/** Reject a promotion */
export function adminRejectPromotion(id: number, data: { reason: string }) {
  return apiPost<{ success: boolean; status: string }>(`/admin/promotions/${id}/reject`, data);
}

/** List disputed orders */
export function adminFetchDisputes(params: { page?: number; status?: string } = {}) {
  return apiGet<PaginatedOrders>(
    `/admin/promotions/disputes${toQueryString(params as Record<string, unknown>)}`
  );
}

/** Resolve a dispute */
export function adminResolveDispute(disputeId: number, data: ResolveDisputeRequest) {
  return apiPost<{ success: boolean }>(
    `/admin/promotions/disputes/${disputeId}/resolve`,
    data
  );
}

/** Platform-wide analytics */
export function adminFetchAnalytics() {
  return apiGet<{ data: AdminAnalytics }>("/admin/promotions/analytics");
}
