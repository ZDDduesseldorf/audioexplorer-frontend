import { create } from "zustand";
import { isUncategorized } from "../domain/category";
import { findNearestUncategorized } from "../domain/neighbors";
import type { PointData } from "../domain/types";

export { UNKNOWN_CATEGORY, isUncategorized } from "../domain/category";

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
  // Number of distinct clusters in `points`, used to scale the color
  // gradient consistently regardless of active filters.
  clusterCount: number;
  setPoints: (points: PointData[]) => void;

  // --- Selection ---
  selectedId: string | null;
  select: (id: string) => void;
  clearSelection: () => void;
  // Ids visited during the current "Next" chain, so it doesn't bounce
  // back and forth between the same two uncategorized samples.
  visitedIds: ReadonlySet<string>;
  // Set whenever selection changes programmatically (e.g. via "Next") to
  // ask the graph view to pan the camera to the newly selected point.
  focusRequest: { id: string } | null;
  // Selects the closest still-uncategorized point to the current selection.
  // Returns false (and leaves the selection untouched) if none is found.
  selectNextUncategorized: () => boolean;

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
  const stillVisible = filteredPoints.some((p) => p.id === state.selectedId);
  const selectedId = stillVisible ? state.selectedId : null;
  return stillVisible
    ? { ...filters, filteredPoints, selectedId }
    : {
        ...filters,
        filteredPoints,
        selectedId,
        visitedIds: new Set<string>(),
        focusRequest: null,
      };
}

export const useAppStore = create<AppState>((set, get) => ({
  // Data
  points: [],
  filteredPoints: [],
  clusterCount: 0,
  setPoints: (points) =>
    set((state) => ({
      points,
      filteredPoints: applyFilters(points, state),
      clusterCount: points.reduce((max, p) => Math.max(max, p.cluster + 1), 0),
    })),

  // Selection
  selectedId: null,
  // A manual pick on the map starts a fresh "Next" chain.
  select: (id) =>
    set({ selectedId: id, visitedIds: new Set(), focusRequest: null }),
  clearSelection: () =>
    set({ selectedId: null, visitedIds: new Set(), focusRequest: null }),
  visitedIds: new Set<string>(),
  focusRequest: null,
  selectNextUncategorized: () => {
    const state = get();
    const current = state.points.find((p) => p.id === state.selectedId);
    if (!current) return false;

    const visited = new Set(state.visitedIds);
    visited.add(current.id);

    const next = findNearestUncategorized(
      state.filteredPoints,
      current,
      visited,
    );
    if (!next) return false;

    visited.add(next.id);
    set({
      selectedId: next.id,
      visitedIds: visited,
      focusRequest: { id: next.id },
    });
    return true;
  },

  // Graph display
  nodeSize: 1.3,
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
