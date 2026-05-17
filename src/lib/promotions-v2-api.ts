// ============================================================================
// TesoTunes Promotions V2 — API Client
// Covers /promoters/*, /opportunities/*, /activity-hub/*
// ============================================================================

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type {
  PromoterProfileV2,
  PromotionOpportunityV2,
  PromotionApplicationV2,
  ActivityHubSummary,
  ActivityHubWallet,
  ActivityHubEarnings,
  OnboardAsPromoterRequest,
  UpdatePromoterProfileV2Request,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  ApplyToOpportunityRequest,
  BrowseOpportunitiesParams,
  BrowsePromotersParams,
  PaginatedV2,
  AdminPromoterProfile,
  AdminOpportunity,
  AdminOpportunityApplicationsResponse,
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
// Opportunity Feed
// ---------------------------------------------------------------------------

/** Browse open opportunities — public */
export function fetchOpportunities(params: BrowseOpportunitiesParams = {}) {
  return apiGet<PaginatedV2<PromotionOpportunityV2>>(
    `/opportunities${qs(params as Record<string, unknown>)}`
  );
}

/** Single opportunity by UUID — public */
export function fetchOpportunity(uuid: string) {
  return apiGet<{ data: PromotionOpportunityV2 }>(`/opportunities/${uuid}`);
}

/** Post a new opportunity (artist only, owns the content) — auth required */
export function createOpportunity(data: CreateOpportunityRequest) {
  return apiPost<{ data: PromotionOpportunityV2 }>("/opportunities", data);
}

/** Update an opportunity — auth + owner */
export function updateOpportunity(uuid: string, data: UpdateOpportunityRequest) {
  return apiPut<{ data: PromotionOpportunityV2 }>(`/opportunities/${uuid}`, data);
}

/** Cancel an opportunity — auth + owner */
export function cancelOpportunity(uuid: string) {
  return apiDelete<{ message: string }>(`/opportunities/${uuid}`);
}

/** Manually close an opportunity — auth + owner */
export function closeOpportunity(uuid: string) {
  return apiPost<{ message: string }>(`/opportunities/${uuid}/close`);
}

/** Apply to an opportunity as a promoter — auth required */
export function applyToOpportunity(uuid: string, data: ApplyToOpportunityRequest) {
  return apiPost<{ data: PromotionApplicationV2 }>(`/opportunities/${uuid}/apply`, data);
}

/** List applications for an opportunity — auth + owner */
export function fetchOpportunityApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionApplicationV2>>(
    `/opportunities/${uuid}/applications${qs(params as Record<string, unknown>)}`
  );
}

/** Award an application — auth + opportunity owner */
export function awardApplication(uuid: string, applicationId: number) {
  return apiPost<{ message: string }>(
    `/opportunities/${uuid}/applications/${applicationId}/award`
  );
}

/** Shortlist an application — auth + opportunity owner */
export function shortlistApplication(uuid: string, applicationId: number) {
  return apiPost<{ message: string }>(
    `/opportunities/${uuid}/applications/${applicationId}/shortlist`
  );
}

/** Withdraw my own application — auth */
export function withdrawApplication(uuid: string, applicationId: number) {
  return apiDelete<{ message: string }>(
    `/opportunities/${uuid}/applications/${applicationId}`
  );
}

/** My posted opportunities — auth */
export function fetchMyPostedOpportunities(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionOpportunityV2>>(
    `/opportunities/my/posted${qs(params as Record<string, unknown>)}`
  );
}

/** My applications as a promoter — auth */
export function fetchMyApplicationsV2(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionApplicationV2>>(
    `/opportunities/my/applications${qs(params as Record<string, unknown>)}`
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

/** Opportunities posted by me */
export function fetchActivityHubOpportunities(
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<PaginatedV2<PromotionOpportunityV2>>(
    `/activity-hub/opportunities${qs(params as Record<string, unknown>)}`
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
// Admin — Opportunity oversight
// ---------------------------------------------------------------------------

export interface AdminBrowseOpportunitiesParams {
  status?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

/** Admin: list all opportunities */
export function adminFetchOpportunities(params: AdminBrowseOpportunitiesParams = {}) {
  return apiGet<PaginatedV2<AdminOpportunity>>(
    `/admin/opportunities${qs(params as Record<string, unknown>)}`
  );
}

/** Admin: force-close an opportunity */
export function adminCloseOpportunity(uuid: string) {
  return apiPost<{ success: boolean; data: AdminOpportunity }>(
    `/admin/opportunities/${uuid}/close`
  );
}

/** Admin: list all applications for an opportunity */
export function adminFetchOpportunityApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return apiGet<AdminOpportunityApplicationsResponse>(
    `/admin/opportunities/${uuid}/applications${qs(params as Record<string, unknown>)}`
  );
}
