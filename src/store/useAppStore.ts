import { create } from "zustand";

interface Filters {
  showLabeled: boolean;
  showUnlabeled: boolean;
  showTestLabel: boolean;
  searchTerm: string;
}

interface AppState {
  // --- Selection ---
  selectedId: string | null;
  select: (id: string) => void;
  clearSelection: () => void;

  // --- Graph display ---
  nodeSize: number;
  setNodeSize: (size: number) => void;

  // --- Layout ---
  isFilterSidebarOpen: boolean;
  setFilterSidebarOpen: (open: boolean) => void;

  // --- Filters (structure ready, not yet wired to graph) ---
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Selection
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  clearSelection: () => set({ selectedId: null }),

  // Graph display
  nodeSize: 2,
  setNodeSize: (size) => set({ nodeSize: size }),

  // Layout
  isFilterSidebarOpen: true,
  setFilterSidebarOpen: (open) => set({ isFilterSidebarOpen: open }),

  // Filters
  filters: {
    showLabeled: true,
    showUnlabeled: true,
    showTestLabel: true,
    searchTerm: "",
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
}));
