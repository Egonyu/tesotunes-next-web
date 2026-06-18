// ============================================================================
// TesoTunes Promotions V2 — React Query Hooks
// Covers the new opportunity marketplace and activity hub
// ============================================================================

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/lib/promotions-v2-api";
import type {
  BrowseOpportunitiesParams,
  BrowsePromotersParams,
  OnboardAsPromoterRequest,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  ApplyToOpportunityRequest,
  PromoterTier,
} from "@/types/promotions-v2";
import type {
  AdminBrowsePromotersParams,
  AdminBrowseOpportunitiesParams,
} from "@/lib/promotions-v2-api";

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

  // Opportunities
  opportunities: () => [...v2Keys.all, "opportunities"] as const,
  opportunitiesList: (params: BrowseOpportunitiesParams) =>
    [...v2Keys.opportunities(), "list", params] as const,
  opportunity: (uuid: string) => [...v2Keys.opportunities(), uuid] as const,
  opportunityApplications: (uuid: string) =>
    [...v2Keys.opportunities(), uuid, "applications"] as const,
  myPosted: () => [...v2Keys.opportunities(), "my-posted"] as const,
  myApplications: () => [...v2Keys.opportunities(), "my-applications"] as const,

  // Activity Hub
  hub: () => [...v2Keys.all, "activity-hub"] as const,
  hubSummary: () => [...v2Keys.hub(), "summary"] as const,
  hubWallet: () => [...v2Keys.hub(), "wallet"] as const,
  hubOrders: () => [...v2Keys.hub(), "orders"] as const,
  hubOpportunities: () => [...v2Keys.hub(), "opportunities"] as const,
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
// Opportunity hooks
// ---------------------------------------------------------------------------

/** Browse open opportunities — public */
export function useOpportunitiesV2(params: BrowseOpportunitiesParams = {}) {
  return useQuery({
    queryKey: v2Keys.opportunitiesList(params),
    queryFn: () => api.fetchOpportunities(params),
    placeholderData: (prev) => prev,
  });
}

/** Single opportunity by UUID */
export function useOpportunityV2(uuid: string) {
  return useQuery({
    queryKey: v2Keys.opportunity(uuid),
    queryFn: () => api.fetchOpportunity(uuid).then((r) => r.data),
    enabled: !!uuid,
  });
}

/** Post a new opportunity */
export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOpportunityRequest) => api.createOpportunity(data),
    onSuccess: () => {
      toast.success("Opportunity posted! Promoters can now apply.");
      qc.invalidateQueries({ queryKey: v2Keys.opportunities() });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
      qc.invalidateQueries({ queryKey: v2Keys.hubSummary() });
    },
    onError: () => {
      toast.error("Failed to post opportunity.");
    },
  });
}

/** Update an opportunity */
export function useUpdateOpportunity(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOpportunityRequest) =>
      api.updateOpportunity(uuid, data),
    onSuccess: () => {
      toast.success("Opportunity updated.");
      qc.invalidateQueries({ queryKey: v2Keys.opportunity(uuid) });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
    },
    onError: () => {
      toast.error("Failed to update opportunity.");
    },
  });
}

/** Cancel an opportunity */
export function useCancelOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.cancelOpportunity(uuid),
    onSuccess: () => {
      toast.success("Opportunity cancelled.");
      qc.invalidateQueries({ queryKey: v2Keys.opportunities() });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
    },
    onError: () => {
      toast.error("Failed to cancel opportunity.");
    },
  });
}

/** Close an opportunity */
export function useCloseOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.closeOpportunity(uuid),
    onSuccess: () => {
      toast.success("Opportunity closed.");
      qc.invalidateQueries({ queryKey: v2Keys.opportunities() });
      qc.invalidateQueries({ queryKey: v2Keys.myPosted() });
    },
  });
}

/** Apply to an opportunity */
export function useApplyToOpportunity(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyToOpportunityRequest) =>
      api.applyToOpportunity(uuid, data),
    onSuccess: () => {
      toast.success("Application submitted!");
      qc.invalidateQueries({ queryKey: v2Keys.opportunity(uuid) });
      qc.invalidateQueries({ queryKey: v2Keys.myApplications() });
      qc.invalidateQueries({ queryKey: v2Keys.hubApplications() });
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Failed to submit application.";
      toast.error(message);
    },
  });
}

/** List applications for an opportunity (artist view) */
export function useOpportunityApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.opportunityApplications(uuid), params],
    queryFn: () => api.fetchOpportunityApplications(uuid, params),
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
      qc.invalidateQueries({ queryKey: v2Keys.opportunity(uuid) });
      qc.invalidateQueries({ queryKey: v2Keys.opportunityApplications(uuid) });
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
      qc.invalidateQueries({ queryKey: v2Keys.opportunityApplications(uuid) });
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

/** My posted opportunities */
export function useMyPostedOpportunities(
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.myPosted(), params],
    queryFn: () => api.fetchMyPostedOpportunities(params),
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

/** My posted opportunities (hub view) */
export function useActivityHubOpportunities(
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: [...v2Keys.hubOpportunities(), params],
    queryFn: () => api.fetchActivityHubOpportunities(params),
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
  opportunities: (params: AdminBrowseOpportunitiesParams) => ["admin", "opportunities-v2", params] as const,
  opportunityApplications: (uuid: string, params: object) => ["admin", "opp-applications", uuid, params] as const,
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

/** Admin: browse all opportunities */
export function useAdminOpportunitiesV2(params: AdminBrowseOpportunitiesParams = {}) {
  return useQuery({
    queryKey: adminKeys.opportunities(params),
    queryFn: () => api.adminFetchOpportunities(params),
    placeholderData: (prev) => prev,
  });
}

/** Admin: force-close an opportunity */
export function useAdminCloseOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => api.adminCloseOpportunity(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "opportunities-v2"] });
      toast.success("Opportunity closed");
    },
    onError: () => toast.error("Failed to close opportunity"),
  });
}

/** Admin: list applications for an opportunity */
export function useAdminOpportunityApplications(
  uuid: string,
  params: { per_page?: number; page?: number } = {}
) {
  return useQuery({
    queryKey: adminKeys.opportunityApplications(uuid, params),
    queryFn: () => api.adminFetchOpportunityApplications(uuid, params),
    enabled: !!uuid,
  });
}
