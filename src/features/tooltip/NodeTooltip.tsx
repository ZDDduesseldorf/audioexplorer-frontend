import type { PointData } from "../../domain/types";
import "./NodeTooltip.css";

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
      <div className="tooltip-category">{point.category ?? point.label}</div>
      {point.category != null && (
        <div className="tooltip-label">{point.label}</div>
      )}
    </div>
  );
}
