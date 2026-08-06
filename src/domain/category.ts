import type { PointData } from "./types";

export const UNKNOWN_CATEGORY = "unknown";

// Points with category "unknown" (or none at all) count as uncategorized.
export function isUncategorized(point: PointData): boolean {
  return point.category == null || point.category === UNKNOWN_CATEGORY;
}
