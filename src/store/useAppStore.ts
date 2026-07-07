import { create } from "zustand";
import type { PointData } from "../domain/types";

interface Filters {
  showLabeled: boolean;
  showUnlabeled: boolean;
  showTestLabel: boolean;
  searchTerm: string;
}

// Central place for the filter logic. The filters are placeholders for
// now, so the filtered set is identical to the full set; once real
// filter logic lands, this takes the Filters as a second argument.
function applyFilters(points: PointData[]): PointData[] {
  return points;
}

interface AppState {
  // --- Data ---
  points: PointData[]; // full set, as loaded from the API
  filteredPoints: PointData[]; // derived: points minus active filters
  setPoints: (points: PointData[]) => void;

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

  // --- Filters (recompute filteredPoints; logic itself still placeholder) ---
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Data
  points: [],
  filteredPoints: [],
  setPoints: (points) =>
    set({
      points,
      filteredPoints: applyFilters(points),
    }),

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
      filteredPoints: applyFilters(state.points),
    })),
}));
