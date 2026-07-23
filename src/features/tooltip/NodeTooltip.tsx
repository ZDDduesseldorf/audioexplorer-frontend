import type { PointData } from "../../domain/types";

interface NodeTooltipProps {
  hoveredId: string | null;
  position: { x: number; y: number } | null;
  points: PointData[];
  variant?: "hover" | "selected";
}

export function NodeTooltip({
  hoveredId,
  position,
  points,
  variant = "hover",
}: NodeTooltipProps) {
  if (!hoveredId || !position) return null;

  const point = points.find((p) => p.id === hoveredId);
  if (!point) return null;

  return (
    <div
      className={`node-tooltip node-tooltip--${variant}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="tooltip-category">
        {point.category?.trim() || "Uncategorized"}
      </div>
    </div>
  );
}
