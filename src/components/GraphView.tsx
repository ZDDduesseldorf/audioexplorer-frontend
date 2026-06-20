import { useEffect, useRef, useState, useCallback } from "react";
import type { PointData } from "../domain/types";
import { useGraphEngine } from "../graph/engine/useGraphEngine";
import { Minimap } from "../graph/minimap/Minimap";
import { KNNOverlay } from "../graph/overlay/KNNOverlay";
import { NodeTooltip } from "../features/tooltip/NodeTooltip";

interface GraphViewProps {
  points: PointData[];
  selectedId: string | null;
  nodeSize: number;
  isHoverAudioEnabled: boolean;
  onNodeClick: (node: PointData) => void;
  onStageClick: () => void;
}

export function GraphView({
  points,
  selectedId,
  nodeSize,
  isHoverAudioEnabled,
  onNodeClick,
  onStageClick,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [selectedTooltipPos, setSelectedTooltipPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleHoverChange = useCallback(
    (nodeId: string | null, pos: { x: number; y: number } | null) => {
      setHoveredId(nodeId);
      setHoverPos(pos);
    },
    [],
  );

  const handleSelectedTooltipChange = useCallback(
    (_nodeId: string | null, pos: { x: number; y: number } | null) => {
      setSelectedTooltipPos(pos);
    },
    [],
  );

  useEffect(() => {
    if (!selectedId) {
      setSelectedTooltipPos(null);
    }
  }, [selectedId]);

  const engine = useGraphEngine(
    containerRef,
    points,
    nodeSize,
    selectedId,
    isHoverAudioEnabled,
    {
      onNodeClick,
      onStageClick,
      onHoverChange: handleHoverChange,
      onSelectedTooltipChange: handleSelectedTooltipChange,
    },
  );

  return (
    <div className="sigma-container" style={{ position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      <KNNOverlay engine={engine} hoveredId={hoveredId} points={points} />
      <Minimap engine={engine} points={points} />

      {selectedId && selectedTooltipPos && (
        <NodeTooltip
          hoveredId={selectedId}
          position={selectedTooltipPos}
          points={points}
          variant="selected"
        />
      )}

      {hoveredId && hoveredId !== selectedId && hoverPos && (
        <NodeTooltip
          hoveredId={hoveredId}
          position={hoverPos}
          points={points}
          variant="hover"
        />
      )}
    </div>
  );
}