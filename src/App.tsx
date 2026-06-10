import { useState, useCallback, useMemo, ChangeEvent } from "react";
import { GraphView } from "./components/GraphView";
import { NodeDetails } from "./features/node-details/NodeDetails";
import { useAudioData } from "./hooks/useAudioData";
import type { PointData } from "./domain/types";
import "./App.css";

export default function App() {
  const { data: points, loading, error } = useAudioData("data-5k");

  const [selectedNode, setSelectedNode] = useState<PointData | null>(null);
  const [nodeSize, setNodeSize] = useState(2);

  const clusterCount = useMemo(
    () => new Set(points.map((p) => p.cluster)).size,
    [points],
  );

  const handleNodeClick = useCallback(
    (node: PointData) => setSelectedNode(node),
    [],
  );
  const handleStageClick = useCallback(() => setSelectedNode(null), []);

  return (
    <div className="app-layout">
      <div className="canvas-area">
        <div className="header-overlay">
          <h1 className="app-title">Audio Explorer</h1>
          {!loading && (
            <span className="point-count">
              {points.length.toLocaleString()} sounds &middot; {clusterCount}{" "}
              clusters
            </span>
          )}
          {error && (
            <span className="point-count" style={{ color: "#e74c3c" }}>
              {error.message}
            </span>
          )}
        </div>

        <GraphView
          points={points}
          selectedId={selectedNode?.id ?? null}
          nodeSize={nodeSize}
          onNodeClick={handleNodeClick}
          onStageClick={handleStageClick}
        />

        <div className="size-control">
          <label className="size-label">Size</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={nodeSize}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNodeSize(parseFloat(e.target.value))
            }
            className="size-slider"
          />
          <span className="size-value">{nodeSize.toFixed(1)}</span>
        </div>
      </div>

      {selectedNode && (
        <NodeDetails
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
