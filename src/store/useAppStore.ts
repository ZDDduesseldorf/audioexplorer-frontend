import { create } from "zustand";
import type { PointData } from "../domain/types";

// Central place for the filter logic: points whose category is hidden
// are filtered out; points without a category are always visible.
function applyFilters(
  points: PointData[],
  hiddenCategories: ReadonlySet<string>,
): PointData[] {
  if (hiddenCategories.size === 0) return points;
  return points.filter(
    (p) => p.category == null || !hiddenCategories.has(p.category),
  );
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

  // --- Filters ---
  hiddenCategories: ReadonlySet<string>;
  toggleCategory: (name: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Data
  points: [],
  filteredPoints: [],
  setPoints: (points) =>
    set((state) => ({
      points,
      filteredPoints: applyFilters(points, state.hiddenCategories),
    })),

  // Selection
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  clearSelection: () => set({ selectedId: null }),

  // Graph display
  nodeSize: 0.8,
  setNodeSize: (size) => set({ nodeSize: size }),

  // Layout
  isFilterSidebarOpen: true,
  setFilterSidebarOpen: (open) => set({ isFilterSidebarOpen: open }),

  // Filters
  hiddenCategories: new Set<string>(),
  toggleCategory: (name) =>
    set((state) => {
      const hiddenCategories = new Set(state.hiddenCategories);
      if (hiddenCategories.has(name)) {
        hiddenCategories.delete(name);
      } else {
        hiddenCategories.add(name);
      }

      // Deselect the node when its category gets hidden.
      const selected = state.points.find((p) => p.id === state.selectedId);
      const selectedId =
        selected?.category != null && hiddenCategories.has(selected.category)
          ? null
          : state.selectedId;

      return {
        hiddenCategories,
        filteredPoints: applyFilters(state.points, hiddenCategories),
        selectedId,
      };
    }),
}));
