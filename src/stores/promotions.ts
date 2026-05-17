// ============================================================================
// TesoTunes Promotions Module - Zustand Store
// Manages filter state, UI state, and selected items
// ============================================================================

import { create } from "zustand";
import type {
  BrowsePromotionsParams,
} from "@/types/promotions";
import type {
  BrowseOpportunitiesParams,
  BrowsePromotersParams,
  PromotableType,
} from "@/types/promotions-v2";

interface PromotionsState {
  // Browse filters
  filters: BrowsePromotionsParams;
  setFilter: <K extends keyof BrowsePromotionsParams>(
    key: K,
    value: BrowsePromotionsParams[K]
  ) => void;
  setFilters: (filters: Partial<BrowsePromotionsParams>) => void;
  resetFilters: () => void;

  // UI state
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Checkout state
  selectedSongId: number | null;
  setSelectedSongId: (id: number | null) => void;
  checkoutNotes: string;
  setCheckoutNotes: (notes: string) => void;
}

const DEFAULT_FILTERS: BrowsePromotionsParams = {
  sort: "popularity",
  page: 1,
  per_page: 20,
};

export const usePromotionsStore = create<PromotionsState>((set) => ({
  // Filters
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: key === "page" ? value as number : 1 },
    })),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // UI
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),

  // Checkout
  selectedSongId: null,
  setSelectedSongId: (id) => set({ selectedSongId: id }),
  checkoutNotes: "",
  setCheckoutNotes: (notes) => set({ checkoutNotes: notes }),
}));

// ============================================================================
// V2: Opportunity Feed Store
// Filters for the new opportunity marketplace and promoter discovery
// ============================================================================

interface OpportunityFeedState {
  filters: BrowseOpportunitiesParams;
  setFilter: <K extends keyof BrowseOpportunitiesParams>(
    key: K,
    value: BrowseOpportunitiesParams[K]
  ) => void;
  setFilters: (filters: Partial<BrowseOpportunitiesParams>) => void;
  resetFilters: () => void;

  // Onboarding wizard — transient state for the /become-promoter flow
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  onboardingData: Partial<{
    display_name: string;
    slug: string;
    bio: string;
    platforms: string[];
    niches: string[];
    audience_regions: string[];
    audience_summary: string;
    response_time_hours: number;
    social_links: Record<string, string>;
  }>;
  setOnboardingData: (
    data: Partial<OpportunityFeedState["onboardingData"]>
  ) => void;
  resetOnboarding: () => void;

  // Post-opportunity wizard — transient state for the "Promote this track" flow
  newOpportunityData: Partial<{
    promotable_type: PromotableType;
    promotable_id: number;
    title: string;
    brief: string;
    target_platforms: string[];
    budget_min_ugx: number;
    budget_max_ugx: number;
    budget_credits: number;
    deadline_at: string;
  }>;
  setNewOpportunityData: (
    data: Partial<OpportunityFeedState["newOpportunityData"]>
  ) => void;
  resetNewOpportunity: () => void;
}

const DEFAULT_OPPORTUNITY_FILTERS: BrowseOpportunitiesParams = {
  page: 1,
  per_page: 20,
};

export const useOpportunityFeedStore = create<OpportunityFeedState>((set) => ({
  // Filters
  filters: { ...DEFAULT_OPPORTUNITY_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key === "page" ? (value as number) : 1,
      },
    })),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),
  resetFilters: () =>
    set({ filters: { ...DEFAULT_OPPORTUNITY_FILTERS } }),

  // Onboarding wizard
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  onboardingData: {},
  setOnboardingData: (data) =>
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    })),
  resetOnboarding: () => set({ onboardingStep: 0, onboardingData: {} }),

  // Post-opportunity wizard
  newOpportunityData: {},
  setNewOpportunityData: (data) =>
    set((state) => ({
      newOpportunityData: { ...state.newOpportunityData, ...data },
    })),
  resetNewOpportunity: () => set({ newOpportunityData: {} }),
}));

// ============================================================================
// V2: Promoter Discovery Store
// Filters for the /promoters browse page
// ============================================================================

interface PromoterDiscoveryState {
  filters: BrowsePromotersParams;
  setFilter: <K extends keyof BrowsePromotersParams>(
    key: K,
    value: BrowsePromotersParams[K]
  ) => void;
  setFilters: (filters: Partial<BrowsePromotersParams>) => void;
  resetFilters: () => void;
}

const DEFAULT_PROMOTER_FILTERS: BrowsePromotersParams = {
  page: 1,
  per_page: 20,
};

export const usePromoterDiscoveryStore = create<PromoterDiscoveryState>(
  (set) => ({
    filters: { ...DEFAULT_PROMOTER_FILTERS },
    setFilter: (key, value) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [key]: value,
          page: key === "page" ? (value as number) : 1,
        },
      })),
    setFilters: (newFilters) =>
      set((state) => ({
        filters: { ...state.filters, ...newFilters, page: 1 },
      })),
    resetFilters: () =>
      set({ filters: { ...DEFAULT_PROMOTER_FILTERS } }),
  })
);
