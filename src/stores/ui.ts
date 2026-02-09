import { create } from "zustand";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;

  // Player
  playerExpanded: boolean;
  queueVisible: boolean;

  // Search
  searchOpen: boolean;
  searchQuery: string;

  // Theme
  theme: "light" | "dark" | "system";

  // Loading
  isLoading: boolean;

  // Notifications
  notifications: Notification[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  togglePlayerExpanded: () => void;
  setPlayerExpanded: (expanded: boolean) => void;
  toggleQueue: () => void;
  setQueueVisible: (visible: boolean) => void;

  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  setTheme: (theme: "light" | "dark" | "system") => void;

  setLoading: (loading: boolean) => void;

  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  playerExpanded: false,
  queueVisible: false,
  searchOpen: false,
  searchQuery: "",
  theme: "system",
  isLoading: false,
  notifications: [],

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  openModal: (modal, data) => set({ activeModal: modal, modalData: data || null }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  togglePlayerExpanded: () => set((state) => ({ playerExpanded: !state.playerExpanded })),
  setPlayerExpanded: (expanded) => set({ playerExpanded: expanded }),
  toggleQueue: () => set((state) => ({ queueVisible: !state.queueVisible })),
  setQueueVisible: (visible) => set({ queueVisible: visible }),

  setSearchOpen: (open) => set({ searchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setTheme: (theme) => set({ theme }),

  setLoading: (loading) => set({ isLoading: loading }),

  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  removeNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  clearNotifications: () => set({ notifications: [] }),
}));
