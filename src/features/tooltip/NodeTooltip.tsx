import type { PointData } from '../../domain/types';

interface NodeTooltipProps {
  hoveredId: string | null;
  position: { x: number; y: number } | null;
  points: PointData[];
}

export function NodeTooltip({ hoveredId, position, points }: NodeTooltipProps) {
  if (!hoveredId || !position) return null;

  const point = points.find(p => p.id === hoveredId);
  if (!point) return null;

  return (
    <div
      className="node-tooltip"
      style={{
        left: position.x + 12,
        top: position.y - 40,
      }}
    >
      <div className="tooltip-label">{point.label}</div>
      <div className="tooltip-coords">
        x: {point.x.toFixed(2)}, y: {point.y.toFixed(2)}
      </div>
    </div>
  );
}
