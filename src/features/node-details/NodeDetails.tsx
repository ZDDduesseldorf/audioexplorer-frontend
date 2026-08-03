import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import type { PointData } from "../../domain/types";
import { createLabeledSample } from "../../services/audioDataService";
import { getAudioByUuid } from "../../services/audioPlayerService";
import {
  isUncategorized,
  UNKNOWN_CATEGORY,
  useAppStore,
} from "../../store/useAppStore";
import { AudioWaveform } from "./AudioWaveform";
import "./AnomalyPopup.css";
import "./NodeDetails.css";

interface NodeDetailsProps {
  node: PointData | null;
}

interface AnomalyValueButtonProps {
  algorithmName: string;
  value: number | null;
}

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

const PARTICLE_COUNT = 14;

function formatAnomalyValue(value: number | null): string {
  return value === null ? "—" : `${value}%`;
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

function getLabel(label: string | null): string {
  return label?.trim() || "—";
}

function getParticleStyle(index: number): CSSProperties {
  return {
    left: `${8 + ((index * 37) % 84)}%`,
    bottom: `${5 + ((index * 29) % 88)}%`,
    animationDelay: `${-(index % 7) * 0.45}s`,
    animationDuration: `${3.2 + (index % 5) * 0.5}s`,
  };
}

function AnomalyValueButton({ algorithmName, value }: AnomalyValueButtonProps) {
  const formattedValue = formatAnomalyValue(value);

  return (
    <button
      type="button"
      className="anomaly-value-button"
      aria-label={`Explore anomalies for ${algorithmName}. Current score: ${formattedValue}`}
    >
      <span className="anomaly-value">{formattedValue}</span>

      <span className="anomaly-value-tooltip" role="tooltip">
        Explore Anomalies
      </span>
    </button>
  );
}

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

function AnomalyPopup({ node, isOpen, onClose }: AnomalyPopupProps) {
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

  if (!isOpen) {
    return null;
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

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

export function NodeDetails({ node }: NodeDetailsProps) {
  const clearSelection = useAppStore((s) => s.clearSelection);
  const points = useAppStore((state) => state.points);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAnomalyPopupOpen, setAnomalyPopupOpen] = useState(false);

  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Category the sample was just suggested as; drives the in-sidebar
  // confirmation message. This is only a suggestion stored in the DB.
  const [savedCategory, setSavedCategory] = useState<string | null>(null);

  // Creates a list of all categories returned by the backend.
  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    points.forEach((point) => {
      const category = point.category?.trim();

      if (category && category !== UNKNOWN_CATEGORY) {
        categorySet.add(category);
      }
    });

    return Array.from(categorySet).sort((firstCategory, secondCategory) =>
      firstCategory.localeCompare(secondCategory),
    );
  }, [points]);

  // Preselects the current category and clears leftover save feedback whenever
  // a different sample is opened.
  useEffect(() => {
    setSelectedCategory(node?.category?.trim() ?? "");
    setSaveError(null);
    setSavedCategory(null);
  }, [node?.id, node?.category]);

  if (!node) {
    return null;
  }

  const nodeId = node.id;
  const nodeCategory = node.category?.trim() ?? "";

  // Requests the audio file from the backend.
  const audioUrl = getAudioByUuid(nodeId);

  // Uses the category status provided by the backend.
  const isCategorized = !isUncategorized(node);
  const currentCategory = isCategorized ? nodeCategory : "Uncategorized";

  // Temporary dummy data until the remaining backend routes are connected.
  const sampleDetails = {
    description: "Giggle",
    dataSource: "DS xy",
  };

  function handleConfirm() {
    if (!selectedCategory) {
      return;
    }

    const category = selectedCategory;

    setSaving(true);
    setSaveError(null);
    setSavedCategory(null);

    // Stores only the suggestion in the database. The point stays
    // uncategorized in the frontend because this is not ground truth.
    createLabeledSample(nodeId, category)
      .then(() => {
        setSavedCategory(category);
      })
      .catch((error: unknown) => {
        setSaveError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        setSaving(false);
      });
  }

  function handleNext() {
    console.log("Dummy next sample");
  }

  function openAnomalyPopup() {
    setAnomalyPopupOpen(true);
  }

  function closeAnomalyPopup() {
    setAnomalyPopupOpen(false);
  }

  function handleCloseSidebar() {
    setAnomalyPopupOpen(false);
    clearSelection();
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Selected sample</h2>

          <button
            type="button"
            className="close-btn"
            onClick={handleCloseSidebar}
            aria-label="Close sidebar"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="audio-player">
          <AudioWaveform key={nodeId} audioUrl={audioUrl} />
        </div>

        <div className="sample-details">
          <table className="details-table">
            <tbody>
              <tr>
                <th scope="row">Category</th>
                <td>{currentCategory}</td>
              </tr>

              <tr>
                <th scope="row">Description</th>
                <td>{sampleDetails.description}</td>
              </tr>

              <tr className="interactive-detail-row">
                <th scope="row">Data source</th>
                <td>{sampleDetails.dataSource}</td>
              </tr>
              <tr
                className="interactive-detail-row anomaly-detail-row"
                onClick={openAnomalyPopup}
              >
                <th scope="row">Isolation Forest</th>

                <td>
                  <AnomalyValueButton
                    algorithmName="Isolation Forest"
                    value={node.anomalie_isolation_forest}
                  />
                </td>
              </tr>

              <tr
                className="interactive-detail-row anomaly-detail-row"
                onClick={openAnomalyPopup}
              >
                <th scope="row">Local Outlier Factor</th>

                <td>
                  <AnomalyValueButton
                    algorithmName="Local Outlier Factor"
                    value={node.anomalie_lof}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {!isCategorized && (
          <div className="annotation-section">
            <h3 className="annotation-title">Annotation</h3>

            <div className="annotation-divider" />

            <div className="annotation-status-row">
              <span className="annotation-label">Current Status</span>

              <span className="status-badge uncategorized">Uncategorized</span>
            </div>

            <label
              className="annotation-label category-label"
              htmlFor="category-select"
            >
              Category
            </label>

            <select
              id="category-select"
              className="category-select"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="">Choose a category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {saveError && <p className="annotation-error">{saveError}</p>}

            {savedCategory && (
              <div className="annotation-success" role="status">
                <span className="annotation-success-icon" aria-hidden="true">
                  ✓
                </span>

                <span>
                  Suggestion saved: <strong>{savedCategory}</strong>
                </span>
              </div>
            )}

            <div className="annotation-actions">
              <button
                type="button"
                className="confirm-btn"
                onClick={handleConfirm}
                disabled={!selectedCategory || isSaving}
              >
                {isSaving ? "Saving…" : "Confirm"}
              </button>

              <button type="button" className="next-btn" onClick={handleNext}>
                Next <span aria-hidden="true">▶</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AnomalyPopup
        node={node}
        isOpen={isAnomalyPopupOpen}
        onClose={closeAnomalyPopup}
      />
    </>
  );
}
