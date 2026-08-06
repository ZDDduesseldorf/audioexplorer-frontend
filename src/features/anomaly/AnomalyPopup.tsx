import { useAppStore } from "../../store/useAppStore";
import "./AnomalyPopup.css";

interface AnomalyPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AnomalyPopup({ isOpen, onClose }: AnomalyPopupProps) {
    const points    = useAppStore((s) => s.points);
    const selectedId = useAppStore((s) => s.selectedId);
    const selected  = points.find((p) => p.id === selectedId) ?? null;

    if (!isOpen) return null;

    // Bar chart از iso scores واقعی backend
    const bins = Array.from({ length: 10 }, (_, i) => ({
        range: `${i * 10}–${i * 10 + 10}`,
        count: 0,
        color: i < 3 ? "#3498db" : i < 6 ? "#f39c12" : "#e74c3c",
    }));
    points.forEach((p) => {
        const score = (p as any).anomalie_iso ?? 0;
        bins[Math.min(9, Math.floor(score / 10))].count++;
    });
    const maxCount = Math.max(...bins.map((b) => b.count), 1);

    const iso      = (selected as any)?.anomalie_iso;
    const lof      = (selected as any)?.anomalie_lof;
    const isoLabel = (selected as any)?.anomalie_iso_label ?? "—";
    const lofLabel = (selected as any)?.anomalie_lof_label ?? "—";

    return (
        <div
            className="anomaly-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="Explore Anomalies"
        >
            <div className="anomaly-popup">

                {/* Header */}
                <div className="anomaly-popup-header">
                    <h2 className="anomaly-popup-title">Explore Anomalies</h2>
                    <button
                        type="button"
                        className="anomaly-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >✕</button>
                </div>

                {/* Body */}
                <div className="anomaly-popup-body">

                    {/* Bar Chart */}
                    <div className="anomaly-chart-section">
                        <p className="anomaly-section-label">
                            Anomaly Score Distribution (Isolation Forest)
                        </p>
                        <div className="anomaly-bar-chart">
                            {bins.map((b) => (
                                <div key={b.range} className="anomaly-bar-wrap">
                                    <div
                                        className="anomaly-bar"
                                        style={{
                                            height: `${Math.max(4, (b.count / maxCount) * 100)}%`,
                                            background: b.color,
                                        }}
                                        title={`${b.range}: ${b.count} samples`}
                                    />
                                    <span className="anomaly-bar-label">
                    {b.range.split("–")[0]}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* توضیح + Score Cards */}
                    <div className="anomaly-desc-section">
                        <p className="anomaly-section-label">Anomaly Detection</p>
                        <p className="anomaly-desc-text">
                            Two algorithms identify unusual samples in the dataset.
                        </p>
                        <p className="anomaly-desc-text">
                            <strong>Isolation Forest</strong> isolates anomalies by randomly
                            partitioning data — unusual points need fewer splits.
                        </p>
                        <p className="anomaly-desc-text">
                            <strong>Local Outlier Factor</strong> compares local density to
                            find samples that differ from their neighbors.
                        </p>

                        <div className="anomaly-score-grid">
                            <div className="anomaly-score-card">
                                <p className="anomaly-score-title">Isolation Forest</p>
                                <span className="anomaly-label-badge iso">{isoLabel}</span>
                                <p className="anomaly-score-val">
                                    {iso !== undefined ? `${Number(iso).toFixed(1)}%` : "—"}
                                    <span className="anomaly-score-sub"> anomaly score</span>
                                </p>
                            </div>
                            <div className="anomaly-score-card">
                                <p className="anomaly-score-title">Local Outlier Factor</p>
                                <span className="anomaly-label-badge lof">{lofLabel}</span>
                                <p className="anomaly-score-val">
                                    {lof !== undefined ? `${Number(lof).toFixed(1)}%` : "—"}
                                    <span className="anomaly-score-sub"> anomaly score</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="anomaly-popup-footer">
          <span className="anomaly-popup-meta">
            {selected
                ? `${selected.filename ?? selected.id} · ${selected.category ?? "—"}`
                : "No sample selected — click a point on the map first"}
          </span>
                    <button
                        type="button"
                        className="anomaly-confirm-btn"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
