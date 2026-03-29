import { create } from 'zustand';
import type { ObservabilityFilters, ObservabilityTab } from '@/types/observability';

const defaultFilters: ObservabilityFilters = {
  severity: [],
  domain: [],
  category: [],
  outcome: [],
  actor_type: [],
};

interface ObservabilityState {
  activeTab: ObservabilityTab;
  filters: ObservabilityFilters;
  setActiveTab: (tab: ObservabilityTab) => void;
  setFilters: (filters: Partial<ObservabilityFilters>) => void;
  resetFilters: () => void;
}

export const useObservabilityStore = create<ObservabilityState>((set) => ({
  activeTab: 'overview',
  filters: defaultFilters,
  setActiveTab: (activeTab) => set({ activeTab }),
  setFilters: (incoming) => set((state) => ({
    filters: {
      ...state.filters,
      ...incoming,
    },
  })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
