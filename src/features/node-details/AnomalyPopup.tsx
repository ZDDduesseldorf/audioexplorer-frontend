import { useEffect, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { PointData } from "../../domain/types";
import "./AnomalyPopup.css";

interface AnomalyPopupProps {
  node: PointData;
  isOpen: boolean;
  onClose: () => void;
}

interface AnomalyBarProps {
  title: string;
  value: number | null;
  label: string | null;
  variant: "isolation-forest" | "lof";
}

// Defines how many animated particles are rendered inside each anomaly bar.
const PARTICLE_COUNT = 14;

// Formats the backend anomaly score.
function formatAnomalyValue(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? "—" : `${value}%`;
}

/**
 * Limits only the visual bar height to the range from 0 to 100.
 * The displayed backend value is not changed or rounded.
 */
function getBarHeight(value: number | null): number {
  if (value === null || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

// Returns a fallback when the backend does not provide an anomaly label.
function getLabel(label: string | null): string {
  return label?.trim() || "—";
}

// Creates deterministic positions and animation timings for the particles.
function getParticleStyle(index: number): CSSProperties {
  return {
    left: `${8 + ((index * 37) % 84)}%`,
    bottom: `${5 + ((index * 29) % 88)}%`,
    animationDelay: `${-(index % 7) * 0.45}s`,
    animationDuration: `${3.2 + (index % 5) * 0.5}s`,
  };
}

// Renders one anomaly score as a bar with its label and numeric value.
function AnomalyBar({ title, value, label, variant }: AnomalyBarProps) {
  const barHeight = getBarHeight(value);

  return (
    <article className={`anomaly-result anomaly-result--${variant}`}>
      <div className="anomaly-chart-column">
        <div
          className="anomaly-chart-track"
          role="img"
          aria-label={`${title}: ${formatAnomalyValue(value)}`}
        >
          <div
            className={`anomaly-chart-fill anomaly-chart-fill--${variant}`}
            style={{ height: `${barHeight}%` }}
          >
            <div className="anomaly-particles" aria-hidden="true">
              {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
                <span
                  key={`${variant}-particle-${index}`}
                  className="anomaly-particle"
                  style={getParticleStyle(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <strong className="anomaly-chart-value">
          {formatAnomalyValue(value)}
        </strong>

        <span className="anomaly-chart-name">{title}</span>
      </div>

      <div className="anomaly-result-details">
        <h3 className="anomaly-result-title">{title}</h3>

        <dl className="anomaly-result-list">
          <div className="anomaly-result-row">
            <dt>Label</dt>

            <dd>
              <span className={`anomaly-label anomaly-label--${variant}`}>
                {getLabel(label)}
              </span>
            </dd>
          </div>

          <div className="anomaly-result-row">
            <dt>Score</dt>
            <dd>{formatAnomalyValue(value)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export function AnomalyPopup({ node, isOpen, onClose }: AnomalyPopupProps) {
  // Closes the popup when Escape is pressed while the dialog is open.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevents the popup markup from being rendered while it is closed.
  if (!isOpen) {
    return null;
  }

  // Closes the popup only when the backdrop itself is clicked.
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  // Renders the dialog at document.body level so it is not limited by the sidebar.
  return createPortal(
    <div className="anomaly-popup-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="anomaly-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="anomaly-popup-title"
        aria-describedby="anomaly-popup-description"
      >
        <header className="anomaly-popup-header">
          <div>
            <p className="anomaly-popup-eyebrow">Selected sample</p>

            <h2 id="anomaly-popup-title" className="anomaly-popup-title">
              Explore Anomalies
            </h2>
          </div>

          <button
            type="button"
            className="anomaly-popup-close"
            onClick={onClose}
            aria-label="Close anomaly popup"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className="anomaly-popup-divider" />

        <div className="anomaly-popup-content">
          <div className="anomaly-popup-results" aria-live="polite">
            <AnomalyBar
              title="Isolation Forest"
              value={node.anomalie_isolation_forest}
              label={node.anomalie_isolation_forest_label}
              variant="isolation-forest"
            />

            <AnomalyBar
              title="Local Outlier Factor"
              value={node.anomalie_lof}
              label={node.anomalie_lof_label}
              variant="lof"
            />
          </div>

          <aside className="anomaly-popup-explanation">
            <h3>Anomaly Detection</h3>

            <p id="anomaly-popup-description">
              We use two unsupervised learning algorithms:
            </p>

            <p>
              <strong>Isolation Forest</strong> detects global anomalies across
              the entire embedding space.
            </p>

            <p>
              <strong>Local Outlier Factor (LOF)</strong> detects local
              anomalies based on neighbourhood density.
            </p>

            <p>
              Samples located far from other embeddings or in regions with
              significantly lower local density are considered highly anomalous.
            </p>
          </aside>
        </div>
      </section>
    </div>,
    document.body,
  );
}
