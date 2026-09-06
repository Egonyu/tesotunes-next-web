// ============================================================================
// TesoTunes Promotions V2 — React Query Hooks
// Covers the new promotionRequest marketplace and activity hub
// ============================================================================

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/lib/promotions-v2-api";
import type {
  BrowsePromotionRequestsParams,
  BrowsePromotersParams,
  OnboardAsPromoterRequest,
  CreatePromotionRequestPayload,
  UpdatePromotionRequestPayload,
  ApplyToPromotionRequestPayload,
  PromoterTier,
} from "@/types/promotions-v2";
import type {
  AdminBrowsePromotersParams,
  AdminBrowsePromotionRequestsParams,
} from "@/lib/promotions-v2-api";
import { getErrorMessage } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const v2Keys = {
  all: ["promotions-v2"] as const,

  // Promoters
  promoters: () => [...v2Keys.all, "promoters"] as const,
  promotersList: (params: BrowsePromotersParams) =>
    [...v2Keys.promoters(), "list", params] as const,
  promoter: (slug: string) => [...v2Keys.promoters(), slug] as const,
  myPromoterProfile: () => [...v2Keys.promoters(), "me"] as const,

  // PromotionRequests
  promotionRequests: () => [...v2Keys.all, "promotionRequests"] as const,
  promotionRequestsList: (params: BrowsePromotionRequestsParams) =>
    [...v2Keys.promotionRequests(), "list", params] as const,
  promotionRequest: (uuid: string) => [...v2Keys.promotionRequests(), uuid] as const,
  promotionRequestApplications: (uuid: string) =>
    [...v2Keys.promotionRequests(), uuid, "applications"] as const,
  myPosted: () => [...v2Keys.promotionRequests(), "my-posted"] as const,
  myApplications: () => [...v2Keys.promotionRequests(), "my-applications"] as const,

  // Activity Hub
  hub: () => [...v2Keys.all, "activity-hub"] as const,
  hubSummary: () => [...v2Keys.hub(), "summary"] as const,
  hubWallet: () => [...v2Keys.hub(), "wallet"] as const,
  hubOrders: () => [...v2Keys.hub(), "orders"] as const,
  hubPromotionRequests: () => [...v2Keys.hub(), "promotionRequests"] as const,
  hubApplications: () => [...v2Keys.hub(), "applications"] as const,
  hubEarnings: () => [...v2Keys.hub(), "earnings"] as const,
};

// ---------------------------------------------------------------------------
// Promoter hooks
// ---------------------------------------------------------------------------

/** Browse promoter profiles */
export function usePromotersV2(params: BrowsePromotersParams = {}) {
  return useQuery({
    queryKey: v2Keys.promotersList(params),
    queryFn: () => api.fetchPromoters(params),
    placeholderData: (prev) => prev,
  });
}

/** My promoter profile */
export function useMyPromoterProfileV2() {
  return useQuery({
    queryKey: v2Keys.myPromoterProfile(),
    queryFn: () => api.fetchMyPromoterProfileV2().then((r) => r.data),
    retry: false,
  });
}

/** Become a promoter */
export function useOnboardAsPromoter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OnboardAsPromoterRequest) => api.onboardAsPromoter(data),
    onSuccess: () => {
      toast.success("Welcome! Your promoter profile is live.");
      qc.invalidateQueries({ queryKey: v2Keys.myPromoterProfile() });
      qc.invalidateQueries({ queryKey: v2Keys.hubSummary() });
    },
    onError: () => {
      toast.error("Failed to set up promoter profile. Please try again.");
    },
  });
}

// ---------------------------------------------------------------------------
// PromotionRequest hooks
// ---------------------------------------------------------------------------

/** Browse open promotionRequests — public */
export function usePromotionRequestsV2(params: BrowsePromotionRequestsParams = {}) {
  return useQuery({
    queryKey: v2Keys.promotionRequestsList(params),
    queryFn: () => api.fetchPromotionRequests(params),
    placeholderData: (prev) => prev,
  });
}

/** Single promotionRequest by UUID */
export function usePromotionRequestV2(uuid: string) {
  return useQuery({
    queryKey: v2Keys.promotionRequest(uuid),
    queryFn: () => api.fetchPromotionRequest(uuid).then((r) => r.data),
    enabled: !!uuid,
  });
}

/** Post a new promotionRequest */
export function useCreatePromotionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePromotionRequestPayload) => api.createPromotionRequest(data),
    onSuccess: () => {
      toast.success("PromotionRequest posted! Promoters can now apply.");
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequests() });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
      qc.invalidateQueries({ queryKey: v2Keys.hubSummary() });
    },
    onError: () => {
      toast.error("Failed to post promotionRequest.");
    },
  });
}

/** Update an promotionRequest */
export function useUpdatePromotionRequest(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePromotionRequestPayload) =>
      api.updatePromotionRequest(uuid, data),
    onSuccess: () => {
      toast.success("PromotionRequest updated.");
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequest(uuid) });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
    },
    onError: () => {
      toast.error("Failed to update promotionRequest.");
    },
  });
}

/** Cancel an promotionRequest */
export function useCancelPromotionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.cancelPromotionRequest(uuid),
    onSuccess: () => {
      toast.success("PromotionRequest cancelled.");
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequests() });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
    },
    onError: () => {
      toast.error("Failed to cancel promotionRequest.");
    },
  });
}

/** Close an promotionRequest */
export function useClosePromotionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.closePromotionRequest(uuid),
    onSuccess: () => {
      toast.success("PromotionRequest closed.");
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequests() });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
    },
  });
}

/** Apply to an promotionRequest */
export function useApplyToPromotionRequest(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyToPromotionRequestPayload) =>
      api.applyToPromotionRequest(uuid, data),
    onSuccess: () => {
      toast.success("Application submitted!");
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequest(uuid) });
      qc.invalidateQueries({ queryKey: v2Keys.myApplications() });
      qc.invalidateQueries({ queryKey: v2Keys.hubApplications() });
    },
    onError: (err) => {
      const message =
        getErrorMessage(err, "Failed to submit application.");
      toast.error(message);
    },
  });
}

/** List applications for an promotionRequest (artist view) */
export function usePromotionRequestApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.promotionRequestApplications(uuid), params],
    queryFn: () => api.fetchPromotionRequestApplications(uuid, params),
    enabled: !!uuid,
  });
}

/** Award an application */
export function useAwardApplication(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: number) =>
      api.awardApplication(uuid, applicationId),
    onSuccess: () => {
      toast.success("Application awarded! The promoter has been notified.");
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequest(uuid) });
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequestApplications(uuid) });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
    },
    onError: () => {
      toast.error("Failed to award application.");
    },
  });
}

/** Shortlist an application */
export function useShortlistApplication(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: number) =>
      api.shortlistApplication(uuid, applicationId),
    onSuccess: () => {
      toast.success("Application shortlisted.");
      qc.invalidateQueries({ queryKey: v2Keys.promotionRequestApplications(uuid) });
    },
    onError: () => {
      toast.error("Failed to shortlist application.");
    },
  });
}

/** Withdraw my own application */
export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, applicationId }: { uuid: string; applicationId: number }) =>
      api.withdrawApplication(uuid, applicationId),
    onSuccess: () => {
      toast.success("Application withdrawn.");
      qc.invalidateQueries({ queryKey: v2Keys.myApplications() });
      qc.invalidateQueries({ queryKey: v2Keys.hubApplications() });
    },
    onError: () => {
      toast.error("Failed to withdraw application.");
    },
  });
}

/** My posted promotionRequests */
export function useMyPostedPromotionRequests(
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.myPosted(), params],
    queryFn: () => api.fetchMyPostedPromotionRequests(params),
  });
}

// ---------------------------------------------------------------------------
// Activity Hub hooks
// ---------------------------------------------------------------------------

/** Universal dashboard summary — wallet + promoter status + pending counts */
export function useActivityHubSummary() {
  return useQuery({
    queryKey: v2Keys.hubSummary(),
    queryFn: () => api.fetchActivityHubSummary().then((r) => r.data),
    staleTime: 1000 * 60, // 1 min
  });
}

/** Wallet balances */
export function useActivityHubWallet() {
  return useQuery({
    queryKey: v2Keys.hubWallet(),
    queryFn: () => api.fetchActivityHubWallet().then((r) => r.data),
    staleTime: 1000 * 30,
  });
}

/** Orders (buyer view) */
export function useActivityHubOrders(
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.hubOrders(), params],
    queryFn: () => api.fetchActivityHubOrders(params),
  });
}

/** My posted promotionRequests (hub view) */
export function useActivityHubPromotionRequests(
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.hubPromotionRequests(), params],
    queryFn: () => api.fetchActivityHubPromotionRequests(params),
  });
}

/** My applications (hub view — promoter) */
export function useActivityHubApplications(
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.hubApplications(), params],
    queryFn: () => api.fetchActivityHubApplications(params),
  });
}

/** Earnings summary (promoter / seller) */
export function useActivityHubEarnings(
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.hubEarnings(), params],
    queryFn: () => api.fetchActivityHubEarnings(params).then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Admin hooks
// ---------------------------------------------------------------------------

const adminKeys = {
  promoters: (params: AdminBrowsePromotersParams) => ["admin", "promoters-v2", params] as const,
  promotionRequests: (params: AdminBrowsePromotionRequestsParams) => ["admin", "promotionRequests-v2", params] as const,
  promotionRequestApplications: (uuid: string, params: object) => ["admin", "opp-applications", uuid, params] as const,
};

/** Admin: browse all promoter profiles */
export function useAdminPromotersV2(params: AdminBrowsePromotersParams = {}) {
  return useQuery({
    queryKey: adminKeys.promoters(params),
    queryFn: () => api.adminFetchPromoters(params),
    placeholderData: (prev) => prev,
  });
}

/** Admin: verify a promoter */
export function useAdminVerifyPromoter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.adminVerifyPromoter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promoters-v2"] });
      toast.success("Promoter verified");
    },
    onError: () => toast.error("Failed to verify promoter"),
  });
}

/** Admin: unverify a promoter */
export function useAdminUnverifyPromoter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.adminUnverifyPromoter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promoters-v2"] });
      toast.success("Verification removed");
    },
    onError: () => toast.error("Failed to remove verification"),
  });
}

/** Admin: manually set promoter tier */
export function useAdminSetPromoterTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tier }: { id: number; tier: PromoterTier }) =>
      api.adminSetPromoterTier(id, { tier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promoters-v2"] });
      toast.success("Tier updated");
    },
    onError: () => toast.error("Failed to update tier"),
  });
}

/** Admin: browse all promotionRequests */
export function useAdminPromotionRequestsV2(params: AdminBrowsePromotionRequestsParams = {}) {
  return useQuery({
    queryKey: adminKeys.promotionRequests(params),
    queryFn: () => api.adminFetchPromotionRequests(params),
    placeholderData: (prev) => prev,
  });
}

/** Admin: force-close an promotionRequest */
export function useAdminClosePromotionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.adminClosePromotionRequest(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promotionRequests-v2"] });
      toast.success("PromotionRequest closed");
    },
    onError: () => toast.error("Failed to close promotionRequest"),
  });
}

/** Admin: list applications for an promotionRequest */
export function useAdminPromotionRequestApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: adminKeys.promotionRequestApplications(uuid, params),
    queryFn: () => api.adminFetchPromotionRequestApplications(uuid, params),
    enabled: !!uuid,
  });
}
