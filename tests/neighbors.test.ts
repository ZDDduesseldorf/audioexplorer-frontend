import { describe, expect, it } from "vitest";
import { findNearestUncategorized } from "../src/domain/neighbors";
import type { PointData } from "../src/domain/types";

function point(id: string, x: number, y: number, category?: string): PointData {
  return {
    id,
    x,
    y,
    cluster: 0,
    label: "",
    category,
    anomalie_isolation_forest: null,
    anomalie_lof: null,
    anomalie_isolation_forest_label: null,
    anomalie_lof_label: null,
  };
}

describe("findNearestUncategorized", () => {
  it("returns the closest uncategorized point by straight-line distance", () => {
    const origin = point("origin", 0, 0);
    const far = point("far", 10, 10);
    const near = point("near", 1, 1);

    const result = findNearestUncategorized(
      [origin, far, near],
      origin,
      new Set(),
    );

    expect(result?.id).toBe("near");
  });

  it("ignores categorized points, including those explicitly labeled unknown", () => {
    const origin = point("origin", 0, 0);
    const categorized = point("categorized", 1, 1, "speech");
    const unknown = point("unknown", 1, 1, "unknown");
    const uncategorized = point("uncategorized", 2, 2);

    const result = findNearestUncategorized(
      [origin, categorized, unknown, uncategorized],
      origin,
      new Set(),
    );

    expect(result?.id).toBe("uncategorized");
  });

  it("skips ids in excludeIds", () => {
    const origin = point("origin", 0, 0);
    const near = point("near", 1, 1);
    const farther = point("farther", 2, 2);

    const result = findNearestUncategorized(
      [origin, near, farther],
      origin,
      new Set(["near"]),
    );

    expect(result?.id).toBe("farther");
  });

  it("returns null when no uncategorized candidate remains", () => {
    const origin = point("origin", 0, 0);
    const categorized = point("categorized", 1, 1, "speech");

    const result = findNearestUncategorized(
      [origin, categorized],
      origin,
      new Set(),
    );

    expect(result).toBeNull();
  });
});
