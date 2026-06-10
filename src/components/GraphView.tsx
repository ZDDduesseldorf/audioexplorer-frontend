import { useRef, useState, useCallback } from "react";
import type { PointData } from "../domain/types";
import { useGraphEngine } from "../graph/engine/useGraphEngine";
import { Minimap } from "../graph/minimap/Minimap";
import { KNNOverlay } from "../graph/overlay/KNNOverlay";
import { NodeTooltip } from "../features/tooltip/NodeTooltip";

interface GraphViewProps {
  points: PointData[];
  selectedId: string | null;
  nodeSize: number;
  onNodeClick: (node: PointData) => void;
  onStageClick: () => void;
}

export function GraphView({
  points,
  selectedId,
  nodeSize,
  onNodeClick,
  onStageClick,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const handleHoverChange = useCallback(
    (nodeId: string | null, pos: { x: number; y: number } | null) => {
      setHoveredId(nodeId);
      setHoverPos(pos);
    },
    [],
  );

  const engine = useGraphEngine(containerRef, points, nodeSize, selectedId, {
    onNodeClick,
    onStageClick,
    onHoverChange: handleHoverChange,
  });

  return (
    <div className="sigma-container" style={{ position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <KNNOverlay engine={engine} hoveredId={hoveredId} points={points} />
      <Minimap engine={engine} points={points} />
      <NodeTooltip hoveredId={hoveredId} position={hoverPos} points={points} />
    </div>
  );
}
