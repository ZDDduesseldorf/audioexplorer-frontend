import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";
import { GraphView } from "./components/GraphView";
import { NodeDetails } from "./features/node-details/NodeDetails";
import { FilterSidebar } from "./features/filters/FilterSidebar";
import type { CategoryInfo } from "./features/filters/FilterSidebar";
import { useAudioData } from "./hooks/useAudioData";
import { getClusterColor } from "./domain/clusters";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AboutPage } from "./components/AboutPage";
import type { PointData } from "./domain/types";
import "./App.css";

export default function App() {
  const { data: points, loading, error } = useAudioData("data-5k");

  const [selectedNode, setSelectedNode] = useState<PointData | null>(null);
  const [nodeSize, setNodeSize] = useState(2);

  const [showAboutPage, setShowAboutPage] = useState(false);

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);

  const [hiddenCategories, setHiddenCategories] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const categories = useMemo<CategoryInfo[]>(() => {
    const counts = new Map<string, number>();
    const clusters = new Map<string, number>();
    for (const p of points) {
      if (p.category == null) continue;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
      clusters.set(p.category, p.cluster);
    }
    return [...counts.keys()].sort().map((name) => ({
      name,
      count: counts.get(name)!,
      color: getClusterColor(clusters.get(name)!),
    }));
  }, [points]);

  const visiblePoints = useMemo(
    () =>
      hiddenCategories.size === 0
        ? points
        : points.filter(
            (p) => p.category == null || !hiddenCategories.has(p.category),
          ),
    [points, hiddenCategories],
  );

  const toggleCategory = useCallback((name: string) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  // Deselect a node when its category gets hidden.
  useEffect(() => {
    setSelectedNode((node) =>
      node?.category != null && hiddenCategories.has(node.category)
        ? null
        : node,
    );
  }, [hiddenCategories]);

  const clusterCount = useMemo(
    () => new Set(visiblePoints.map((p) => p.cluster)).size,
    [visiblePoints],
  );

  const handleNodeClick = useCallback(
    (node: PointData) => setSelectedNode(node),
    [],
  );
  const handleStageClick = useCallback(() => setSelectedNode(null), []);

  return (
    <div className="app-shell">
      <Header
        onAboutClick={() => setShowAboutPage(true)}
        onLogoClick={() => setShowAboutPage(false)}
      />

      {showAboutPage ? (
        <AboutPage />
      ) : (
        <main className="app-layout">
          {isFilterSidebarOpen && (
            <FilterSidebar
              categories={categories}
              hiddenCategories={hiddenCategories}
              onToggleCategory={toggleCategory}
              onClose={() => setIsFilterSidebarOpen(false)}
            />
          )}

          {!isFilterSidebarOpen && (
            <button
              className="filter-open-btn"
              type="button"
              onClick={() => setIsFilterSidebarOpen(true)}
              aria-label="Show filter sidebar"
            >
              →
            </button>
          )}

          <div className="canvas-area">
            <div className="map-panel">
              <div className="header-overlay">
                <h1 className="app-title">Audio Explorer</h1>
                {!loading && (
                  <span className="point-count">
                    {visiblePoints.length.toLocaleString()} sounds &middot;{" "}
                    {clusterCount} clusters
                  </span>
                )}
                {error && (
                  <span className="point-count" style={{ color: "#e74c3c" }}>
                    {error.message}
                  </span>
                )}
              </div>
              <GraphView
                points={visiblePoints}
                selectedId={selectedNode?.id ?? null}
                nodeSize={nodeSize}
                isHoverAudioEnabled={!selectedNode && !isFilterSidebarOpen}
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
          </div>

          {selectedNode && (
            <NodeDetails
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}
