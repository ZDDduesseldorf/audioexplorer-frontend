import { useState, useMemo, ChangeEvent } from "react";
import { GraphView } from "./components/GraphView";
import { NodeDetails } from "./features/node-details/NodeDetails";
import { FilterSidebar } from "./features/filters/FilterSidebar";
import { useAudioData } from "./hooks/useAudioData";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AboutPage } from "./components/AboutPage";
import { useAppStore } from "./store/useAppStore";
import "./App.css";

export default function App() {
  const { loading, error } = useAudioData("data-5k");

  const {
    points,
    filteredPoints,
    selectedId,
    nodeSize,
    setNodeSize,
    isFilterSidebarOpen,
    setFilterSidebarOpen,
  } = useAppStore();

  const selectedNode = useMemo(
    () => points.find((p) => p.id === selectedId) ?? null,
    [points, selectedId],
  );

  const clusterCount = useMemo(
    () => new Set(filteredPoints.map((p) => p.cluster)).size,
    [filteredPoints],
  );

  // showAboutPage stays local — only App + Header use it
  const [showAboutPage, setShowAboutPage] = useState(false);

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
          {isFilterSidebarOpen && <FilterSidebar />}

          {!isFilterSidebarOpen && (
            <button
              className="filter-open-btn"
              type="button"
              onClick={() => setFilterSidebarOpen(true)}
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
                    {filteredPoints.length.toLocaleString()} sounds &middot;{" "}
                    {clusterCount} clusters
                  </span>
                )}
                {error && (
                  <span className="point-count" style={{ color: "#e74c3c" }}>
                    {error.message}
                  </span>
                )}
              </div>

              <GraphView />

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

          {selectedNode && <NodeDetails node={selectedNode} />}
        </main>
      )}

      <Footer />
    </div>
  );
}
