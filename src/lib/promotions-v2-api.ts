// ============================================================================
// TesoTunes Promotions V2 — API Client
// Covers /promoters/*, /promotionRequests/*, /activity-hub/*
// ============================================================================

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type {
  PromoterProfileV2,
  PromotionRequestV2,
  PromotionApplicationV2,
  ActivityHubSummary,
  ActivityHubWallet,
  ActivityHubEarnings,
  OnboardAsPromoterRequest,
  UpdatePromoterProfileV2Request,
  CreatePromotionRequestPayload,
  UpdatePromotionRequestPayload,
  ApplyToPromotionRequestPayload,
  BrowsePromotionRequestsParams,
  BrowsePromotersParams,
  PaginatedV2,
  AdminPromoterProfile,
  AdminPromotionRequest,
  AdminPromotionRequestApplicationsResponse,
  AdminSetTierRequest,
  PromoterTier,
} from "@/types/promotions-v2";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      sp.append(k, String(v));
    }
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------------------
// Promoter Onboarding & Profiles
// ---------------------------------------------------------------------------

/** Discover / browse promoter profiles — public */
export function fetchPromoters(params: BrowsePromotersParams = {}) {
  return apiGet<PaginatedV2<PromoterProfileV2>>(
    `/promoters/discover${qs(params as Record<string, unknown>)}`
  );
}

/** Single promoter profile by slug — public */
export function fetchPromoterBySlug(slug: string) {
  return apiGet<{ data: PromoterProfileV2 }>(`/promoters/${slug}`);
}

/** Become a promoter — auth required */
export function onboardAsPromoter(data: OnboardAsPromoterRequest) {
  return apiPost<{ data: PromoterProfileV2 }>("/promoters/onboard", data);
}

/** My promoter profile — auth required */
export function fetchMyPromoterProfileV2() {
  return apiGet<{ data: PromoterProfileV2 }>("/promoters/me/profile");
}

/** Update my promoter profile — auth required */
export function updateMyPromoterProfileV2(data: UpdatePromoterProfileV2Request) {
  return apiPut<{ data: PromoterProfileV2 }>("/promoters/me/profile", data);
}

// ---------------------------------------------------------------------------
// PromotionRequest Feed
// ---------------------------------------------------------------------------

/** Browse open promotionRequests — public */
export function fetchPromotionRequests(params: BrowsePromotionRequestsParams = {}) {
  return apiGet<PaginatedV2<PromotionRequestV2>>(
    `/promotion-requests${qs(params as Record<string, unknown>)}`
  );
}

/** Single promotionRequest by UUID — public */
export function fetchPromotionRequest(uuid: string) {
  return apiGet<{ data: PromotionRequestV2 }>(`/promotion-requests/${uuid}`);
}

/** Post a new promotionRequest (artist only, owns the content) — auth required */
export function createPromotionRequest(data: CreatePromotionRequestPayload) {
  return apiPost<{ data: PromotionRequestV2 }>("/promotion-requests", data);
}

/** Update an promotionRequest — auth + owner */
export function updatePromotionRequest(uuid: string, data: UpdatePromotionRequestPayload) {
  return apiPut<{ data: PromotionRequestV2 }>(`/promotion-requests/${uuid}`, data);
}

/** Cancel an promotionRequest — auth + owner */
export function cancelPromotionRequest(uuid: string) {
  return apiDelete<{ message: string }>(`/promotion-requests/${uuid}`);
}

/** Manually close an promotionRequest — auth + owner */
export function closePromotionRequest(uuid: string) {
  return apiPost<{ message: string }>(`/promotion-requests/${uuid}/close`);
}

/** Apply to an promotionRequest as a promoter — auth required */
export function applyToPromotionRequest(uuid: string, data: ApplyToPromotionRequestPayload) {
  return apiPost<{ data: PromotionApplicationV2 }>(`/promotion-requests/${uuid}/apply`, data);
}

/** List applications for an promotionRequest — auth + owner */
export function fetchPromotionRequestApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionApplicationV2>>(
    `/promotion-requests/${uuid}/applications${qs(params as Record<string, unknown>)}`
  );
}

/** Award an application — auth + promotionRequest owner */
export function awardApplication(uuid: string, applicationId: number) {
  return apiPost<{ message: string }>(
    `/promotion-requests/${uuid}/applications/${applicationId}/award`
  );
}

/** Shortlist an application — auth + promotionRequest owner */
export function shortlistApplication(uuid: string, applicationId: number) {
  return apiPost<{ message: string }>(
    `/promotion-requests/${uuid}/applications/${applicationId}/shortlist`
  );
}

/** Withdraw my own application — auth */
export function withdrawApplication(uuid: string, applicationId: number) {
  return apiDelete<{ message: string }>(
    `/promotion-requests/${uuid}/applications/${applicationId}`
  );
}

/** My posted promotionRequests — auth */
export function fetchMyPostedPromotionRequests(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionRequestV2>>(
    `/promotion-requests/my/posted${qs(params as Record<string, unknown>)}`
  );
}

/** My applications as a promoter — auth */
export function fetchMyApplicationsV2(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionApplicationV2>>(
    `/promotion-requests/my/applications${qs(params as Record<string, unknown>)}`
  );
}

// ---------------------------------------------------------------------------
// Activity Hub
// ---------------------------------------------------------------------------

/** Universal summary — wallet + promoter status + pending action counts */
export function fetchActivityHubSummary() {
  return apiGet<ActivityHubSummary>("/activity-hub/summary");
}

/** Wallet balances */
export function fetchActivityHubWallet() {
  return apiGet<ActivityHubWallet>("/activity-hub/wallet");
}

/** Orders (buyer view) */
export function fetchActivityHubOrders(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<Record<string, unknown>>>(
    `/activity-hub/orders${qs(params as Record<string, unknown>)}`
  );
}

/** PromotionRequests posted by me */
export function fetchActivityHubPromotionRequests(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionRequestV2>>(
    `/activity-hub/promotion-requests${qs(params as Record<string, unknown>)}`
  );
}

/** Applications I submitted (promoter view) */
export function fetchActivityHubApplications(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionApplicationV2>>(
    `/activity-hub/applications${qs(params as Record<string, unknown>)}`
  );
}

/** Earnings summary (promoter / seller view) */
export function fetchActivityHubEarnings(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<ActivityHubEarnings>(
    `/activity-hub/earnings${qs(params as Record<string, unknown>)}`
  );
}

// ---------------------------------------------------------------------------
// Admin — Promoter management
// ---------------------------------------------------------------------------

export interface AdminBrowsePromotersParams {
  status?: string;
  tier?: PromoterTier;
  verified?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

/** Admin: list all promoter profiles */
export function adminFetchPromoters(params: AdminBrowsePromotersParams = {}) {
  return apiGet<PaginatedV2<AdminPromoterProfile>>(
    `/admin/promoters${qs(params as Record<string, unknown>)}`
  );
}

/** Admin: verify a promoter */
export function adminVerifyPromoter(id: number) {
  return apiPost<{ success: boolean; data: AdminPromoterProfile }>(
    `/admin/promoters/${id}/verify`
  );
}

/** Admin: unverify a promoter */
export function adminUnverifyPromoter(id: number) {
  return apiPost<{ success: boolean; data: AdminPromoterProfile }>(
    `/admin/promoters/${id}/unverify`
  );
}

/** Admin: manually set promoter tier */
export function adminSetPromoterTier(id: number, data: AdminSetTierRequest) {
  return apiPut<{ success: boolean; data: AdminPromoterProfile }>(
    `/admin/promoters/${id}/tier`,
    data
  );
}

// ---------------------------------------------------------------------------
// Admin — PromotionRequest oversight
// ---------------------------------------------------------------------------

export interface AdminBrowsePromotionRequestsParams {
  status?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

/** Admin: list all promotionRequests */
export function adminFetchPromotionRequests(params: AdminBrowsePromotionRequestsParams = {}) {
  return apiGet<PaginatedV2<AdminPromotionRequest>>(
    `/admin/promotion-requests${qs(params as Record<string, unknown>)}`
  );
}

/** Admin: force-close an promotionRequest */
export function adminClosePromotionRequest(uuid: string) {
  return apiPost<{ success: boolean; data: AdminPromotionRequest }>(
    `/admin/promotion-requests/${uuid}/close`
  );
}

/** Admin: list all applications for an promotionRequest */
export function adminFetchPromotionRequestApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<AdminPromotionRequestApplicationsResponse>(
    `/admin/promotion-requests/${uuid}/applications${qs(params as Record<string, unknown>)}`
  );
}
