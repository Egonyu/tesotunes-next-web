import { create } from 'zustand';

export type ShellSectionKey = 'overview' | 'threats' | 'identity' | 'infra' | 'investigations';

export type ShellTimeRange = '15m' | '1h' | '24h' | '7d' | 'custom';

interface ShellState {
  activeSection: ShellSectionKey;
  activeSubTab: string | null;
  liveRefresh: boolean;
  timeRange: ShellTimeRange;
  setSection: (section: ShellSectionKey) => void;
  setSubTab: (subTab: string | null) => void;
  toggleLiveRefresh: () => void;
  setTimeRange: (range: ShellTimeRange) => void;
}

export const useObservabilityShellStore = create<ShellState>((set) => ({
  activeSection: 'overview',
  activeSubTab: null,
  liveRefresh: true,
  timeRange: '24h',
  setSection: (section) => set({ activeSection: section, activeSubTab: null }),
  setSubTab: (activeSubTab) => set({ activeSubTab }),
  toggleLiveRefresh: () => set((s) => ({ liveRefresh: !s.liveRefresh })),
  setTimeRange: (timeRange) => set({ timeRange }),
}));
