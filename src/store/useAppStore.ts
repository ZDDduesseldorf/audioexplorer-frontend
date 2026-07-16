import { create } from "zustand";
import type { PointData } from "../domain/types";

export const UNKNOWN_CATEGORY = "unknown";

// Points with category "unknown" (or none at all) count as uncategorized.
export function isUncategorized(point: PointData): boolean {
  return point.category == null || point.category === UNKNOWN_CATEGORY;
}

interface FilterState {
  showCategorized: boolean;
  showUncategorized: boolean;
  // Categories deselected in the "Filter by Category" dropdown.
  hiddenCategories: ReadonlySet<string>;
}

// Central place for the filter logic: uncategorized points are controlled
// by the showUncategorized toggle, categorized points by the showCategorized
// toggle plus the per-category dropdown selection.
function applyFilters(points: PointData[], filters: FilterState): PointData[] {
  const { showCategorized, showUncategorized, hiddenCategories } = filters;
  if (showCategorized && showUncategorized && hiddenCategories.size === 0) {
    return points;
  }
  return points.filter((p) =>
    isUncategorized(p)
      ? showUncategorized
      : showCategorized && !hiddenCategories.has(p.category!),
  );
}

interface AppState extends FilterState {
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
  toggleCategorized: () => void;
  toggleUncategorized: () => void;
  toggleCategory: (name: string) => void;
}

// Recomputes the derived filteredPoints for the given filter changes and
// deselects the node when the filters hide it.
function withFilters(state: AppState, changes: Partial<FilterState>) {
  const filters: FilterState = {
    showCategorized: state.showCategorized,
    showUncategorized: state.showUncategorized,
    hiddenCategories: state.hiddenCategories,
    ...changes,
  };
  const filteredPoints = applyFilters(state.points, filters);
  const selectedId = filteredPoints.some((p) => p.id === state.selectedId)
    ? state.selectedId
    : null;
  return { ...filters, filteredPoints, selectedId };
}

export const useAppStore = create<AppState>((set) => ({
  // Data
  points: [],
  filteredPoints: [],
  setPoints: (points) =>
    set((state) => ({
      points,
      filteredPoints: applyFilters(points, state),
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
  showCategorized: true,
  showUncategorized: true,
  hiddenCategories: new Set<string>(),
  toggleCategorized: () =>
    set((state) =>
      withFilters(state, { showCategorized: !state.showCategorized }),
    ),
  toggleUncategorized: () =>
    set((state) =>
      withFilters(state, { showUncategorized: !state.showUncategorized }),
    ),
  toggleCategory: (name) =>
    set((state) => {
      const hiddenCategories = new Set(state.hiddenCategories);
      if (hiddenCategories.has(name)) {
        hiddenCategories.delete(name);
      } else {
        hiddenCategories.add(name);
      }
      return withFilters(state, { hiddenCategories });
    }),
}));
