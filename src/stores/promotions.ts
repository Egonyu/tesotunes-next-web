// ============================================================================
// TesoTunes Promotions Module - Zustand Store
// Manages filter state, UI state, and selected items
// ============================================================================

import { create } from "zustand";
import type {
  PromotionType,
  PromotionPlatform,
  BrowsePromotionsParams,
} from "@/types/promotions";

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
