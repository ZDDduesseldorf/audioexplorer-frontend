import { useState, useMemo, ChangeEvent } from "react";
import { GraphView } from "./components/GraphView";
import { NodeDetails } from "./features/node-details/NodeDetails";
import { FilterSidebar } from "./features/filters/FilterSidebar";
import { AdvancedAudioMetadataPanel } from "./components/AdvancedAudioMetadataPanel";
import { BulkActionBar } from "./components/BulkActionBar";
import { AnomalyPopup } from "./features/anomaly/AnomalyPopup";
import { LoadingScreen } from "./components/LoadingScreen";
import { useAudioData } from "./hooks/useAudioData";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AboutPage } from "./components/AboutPage";
import { useAppStore } from "./store/useAppStore";
import "./styles/layout.css";

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
        clearSelection,
    } = useAppStore();

    const selectedNode = useMemo(
        () => points.find((p) => p.id === selectedId) ?? null,
        [points, selectedId],
    );

    const clusterCount = useMemo(
        () => new Set(filteredPoints.map((p) => p.cluster)).size,
        [filteredPoints],
    );

    const [showAboutPage, setShowAboutPage]         = useState(false);
    const [isExplorerMode, setIsExplorerMode]       = useState(false);
    const [selectedIds, setSelectedIds]             = useState<string[]>([]);
    const [isAnomalyPopupOpen, setAnomalyPopupOpen] = useState(false);

    const handleToggleExplorerMode = () => {
        if (!isExplorerMode) clearSelection();
        setIsExplorerMode((prev) => !prev);
    };

    const handleBulkDownload = () => {
        alert(`درخواست دانلود برای ${selectedIds.length} فایل ارسال شد.`);
    };

    const handleBulkDelete = () => {
        if (window.confirm(`آیا از حذف ${selectedIds.length} فایل انتخاب شده اطمینان دارید؟`)) {
            setSelectedIds([]);
            alert("فایل‌ها با موفقیت حذف شدند.");
        }
    };

    const footerStatus = useMemo(() => {
        if (loading) return "Loading…";
        if (error) return `Error: ${error.message}`;
        if (selectedNode) return `Selected: ${selectedNode.filename}`;
        return undefined;
    }, [loading, error, selectedNode]);

    return (
        <div className="app-shell" style={{ position: 'relative' }}>

            <Header
                onAboutClick={() => setShowAboutPage(true)}
                onLogoClick={() => setShowAboutPage(false)}
                pointCount={loading ? undefined : filteredPoints.length}
                clusterCount={loading ? undefined : clusterCount}
            />

            {loading ? (
                <LoadingScreen message="Loading audio data…" />
            ) : showAboutPage ? (
                <AboutPage />
            ) : (
                <main className={`app-layout ${isExplorerMode ? "explorer-mode" : ""}`}>

                    {!isExplorerMode && isFilterSidebarOpen && <FilterSidebar />}

                    {!isExplorerMode && !isFilterSidebarOpen && (
                        <button
                            className="filter-open-btn"
                            type="button"
                            onClick={() => setFilterSidebarOpen(true)}
                            aria-label="Show filter sidebar"
                        >
                            ✕
                        </button>
                    )}

                    <div className="canvas-area">
                        <div className="map-panel">
                            <button
                                type="button"
                                className={`explorer-mode-button ${isExplorerMode ? "is-active" : ""}`}
                                onClick={handleToggleExplorerMode}
                            >
                                <span>Explore mode</span>
                                <span className="explorer-mode-switch" aria-hidden="true">
                                    <span className="explorer-mode-knob" />
                                </span>
                            </button>

                            <GraphView
                                isExplorerMode={isExplorerMode}
                                onExitExplorerMode={() => setIsExplorerMode(false)}
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

                            {/* دکمه Explore Anomalies */}
                            <button
                                type="button"
                                className="explore-anomalies-btn"
                                onClick={() => setAnomalyPopupOpen(true)}
                            >
                                Explore Anomalies
                            </button>

                        </div>
                    </div>

                    {!isExplorerMode && selectedNode && (
                        <NodeDetails node={selectedNode} />
                    )}

                    {!isExplorerMode && selectedNode && (
                        <AdvancedAudioMetadataPanel
                            point={selectedNode}
                            onClose={clearSelection}
                        />
                    )}

                </main>
            )}

            <Footer status={footerStatus} />

            <BulkActionBar
                selectedCount={selectedIds.length}
                onDownload={handleBulkDownload}
                onDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds([])}
            />

            {/* Anomaly Popup */}
            <AnomalyPopup
                isOpen={isAnomalyPopupOpen}
                onClose={() => setAnomalyPopupOpen(false)}
            />

        </div>
    );
}


