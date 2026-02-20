"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface CreditListing {
  id: number;
  seller: {
    id: number;
    name: string;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  credits_amount: number;
  price_ugx: number;
  rate_per_credit: number;
  min_purchase: number;
  status: "active" | "sold" | "cancelled" | "expired";
  created_at: string;
  expires_at: string | null;
}

export interface MarketplaceStats {
  total_listings: number;
  total_credits_available: number;
  avg_rate: number;
  lowest_rate: number;
  my_active_listings: number;
  my_total_sold: number;
  platform_fee_percent: number;
}

export interface TradeHistory {
  id: number;
  type: "buy" | "sell";
  credits_amount: number;
  price_ugx: number;
  platform_fee: number;
  counterparty: {
    id: number;
    name: string;
    username: string;
  };
  status: "completed" | "pending" | "cancelled" | "disputed";
  created_at: string;
}

interface ListingsFilters {
  sort_by?: "price_asc" | "price_desc" | "credits_desc" | "newest";
  min_credits?: number;
  max_credits?: number;
}

interface CreateListingData {
  credits_amount: number;
  price_ugx: number;
  min_purchase?: number;
}

interface PurchaseData {
  listing_id: number;
  credits_amount?: number; // partial purchase
}

// ============================================================================
// Marketplace Stats
// ============================================================================

export function useMarketplaceStats() {
  return useQuery({
    queryKey: ["credits", "marketplace", "stats"],
    queryFn: () => apiGet<{ data: MarketplaceStats }>("/credits/marketplace/stats"),
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
}

// ============================================================================
// Listings
// ============================================================================

export function useMarketplaceListings(filters?: ListingsFilters) {
  return useInfiniteQuery({
    queryKey: ["credits", "marketplace", "listings", filters],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam) });
      if (filters?.sort_by) params.append("sort_by", filters.sort_by);
      if (filters?.min_credits) params.append("min_credits", String(filters.min_credits));
      if (filters?.max_credits) params.append("max_credits", String(filters.max_credits));
      return apiGet<{
        data: CreditListing[];
        meta: { current_page: number; last_page: number; total: number };
      }>(`/credits/marketplace/listings?${params}`);
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["credits", "marketplace", "my-listings"],
    queryFn: () =>
      apiGet<{ data: CreditListing[] }>("/credits/marketplace/my-listings"),
    select: (res) => res.data,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingData) =>
      apiPost<{ data: CreditListing }>("/credits/marketplace/listings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits", "marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
    },
  });
}

export function useCancelListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) =>
      apiDelete<{ message: string }>(`/credits/marketplace/listings/${listingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits", "marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
    },
  });
}

export function usePurchaseCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseData) =>
      apiPost<{ message: string; credits_received: number; amount_paid: number }>(
        "/credits/marketplace/purchase",
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

// ============================================================================
// Trade History
// ============================================================================

export function useTradeHistory() {
  return useQuery({
    queryKey: ["credits", "marketplace", "history"],
    queryFn: () =>
      apiGet<{ data: TradeHistory[] }>("/credits/marketplace/history"),
    select: (res) => res.data,
  });
}
