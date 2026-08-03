import { useEffect, useMemo, useState } from "react";
import type { PointData } from "../../domain/types";
import { createLabeledSample } from "../../services/audioDataService";
import { getAudioByUuid } from "../../services/audioPlayerService";
import {
  isUncategorized,
  UNKNOWN_CATEGORY,
  useAppStore,
} from "../../store/useAppStore";
import { AnomalyPopup } from "./AnomalyPopup";
import { AudioWaveform } from "./AudioWaveform";
import "./NodeDetails.css";

interface NodeDetailsProps {
  node: PointData | null;
}

interface AnomalyValueButtonProps {
  algorithmName: string;
  value: number | null;
  onClick: () => void;
}

function formatAnomalyValue(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

function AnomalyValueButton({
  algorithmName,
  value,
  onClick,
}: AnomalyValueButtonProps) {
  const formattedValue = formatAnomalyValue(value);

  return (
    <button
      type="button"
      className="anomaly-value-button"
      onClick={onClick}
      aria-label={`Explore anomalies for ${algorithmName}. Current score: ${formattedValue}`}
    >
      <span className="anomaly-value">{formattedValue}</span>

      <span className="anomaly-value-tooltip" role="tooltip">
        Explore Anomalies
      </span>
    </button>
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
  // confirmation message. This is only a suggestion stored in the DB — the
  // point is intentionally NOT categorized in the frontend.
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
  const currentCategory = isCategorized
    ? nodeCategory
    : "Uncategorized";

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

    // Only stores the suggestion in the DB; the point stays uncategorized in
    // the frontend since this is a proposal, not ground truth.
    createLabeledSample(nodeId, category)
      .then(() => {
        setSavedCategory(category);
      })
      .catch((err: unknown) => {
        setSaveError(err instanceof Error ? err.message : String(err));
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

              <tr className="interactive-detail-row anomaly-detail-row">
                <th scope="row">Isolation Forest</th>

                <td>
                  <AnomalyValueButton
                    algorithmName="Isolation Forest"
                    value={node.anomalie_isolation_forest}
                    onClick={openAnomalyPopup}
                  />
                </td>
              </tr>

              <tr className="interactive-detail-row anomaly-detail-row">
                <th scope="row">Local Outlier Factor</th>

                <td>
                  <AnomalyValueButton
                    algorithmName="Local Outlier Factor"
                    value={node.anomalie_lof}
                    onClick={openAnomalyPopup}
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

              <span className="status-badge uncategorized">
                Uncategorized
              </span>
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
