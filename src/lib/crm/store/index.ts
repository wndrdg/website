import { create } from "zustand";

interface CrmStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Unread counts (updated via realtime)
  unreadMessageCount: number;
  pendingReviewCount: number;
  waitlistCount: number;
  setUnreadMessageCount: (n: number) => void;
  setPendingReviewCount: (n: number) => void;
  setWaitlistCount: (n: number) => void;

  // Command palette
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

export const useCrmStore = create<CrmStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  unreadMessageCount: 0,
  pendingReviewCount: 0,
  waitlistCount: 0,
  setUnreadMessageCount: (n) => set({ unreadMessageCount: n }),
  setPendingReviewCount: (n) => set({ pendingReviewCount: n }),
  setWaitlistCount: (n) => set({ waitlistCount: n }),

  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
}));
