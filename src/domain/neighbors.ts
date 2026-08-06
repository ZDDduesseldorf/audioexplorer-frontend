import { isUncategorized } from "./category";
import type { PointData } from "./types";

// The k nearest neighbor ids of a point, taken from the
// backend-precomputed id -> distance map.
export function nearestNeighborIds(point: PointData, k: number): string[] {
  if (!point.nearestNeighbors) return [];
  return Object.entries(point.nearestNeighbors)
    .sort(([, a], [, b]) => a - b)
    .slice(0, k)
    .map(([id]) => id);
}

// Finds the closest still-uncategorized point to `origin` (by straight-line
// distance on the x/y layout), skipping `origin` itself and anything in
// `excludeIds`. Used to power the "Next" button while labeling samples.
export function findNearestUncategorized(
  points: PointData[],
  origin: PointData,
  excludeIds: ReadonlySet<string>,
): PointData | null {
  let closest: PointData | null = null;
  let closestDistSq = Infinity;

  for (const point of points) {
    if (point.id === origin.id || excludeIds.has(point.id)) continue;
    if (!isUncategorized(point)) continue;

    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < closestDistSq) {
      closestDistSq = distSq;
      closest = point;
    }
  }

  return closest;
}
