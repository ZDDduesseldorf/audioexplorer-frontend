import { useEffect, useMemo, useState } from "react";
import type { PointData } from "../../domain/types";
import { getAudioByUuid } from "../../services/audioPlayerService";
import { useAppStore } from "../../store/useAppStore";
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
  const clearSelection = useAppStore((state) => state.clearSelection);
  const points = useAppStore((state) => state.points);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAnomalyPopupOpen, setAnomalyPopupOpen] = useState(false);

  // Creates a list of all categories returned by the backend.
  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    points.forEach((point) => {
      const category = point.category?.trim();

      if (category) {
        categorySet.add(category);
      }
    });

    return Array.from(categorySet).sort((firstCategory, secondCategory) =>
      firstCategory.localeCompare(secondCategory),
    );
  }, [points]);

  // Selects the current category whenever a different sample is opened.
  useEffect(() => {
    setSelectedCategory(node?.category?.trim() ?? "");
  }, [node?.id, node?.category]);

  if (!node) {
    return null;
  }

  const nodeId = node.id;
  const nodeCategory = node.category?.trim() ?? "";

  // Requests the audio file from the backend.
  const audioUrl = getAudioByUuid(nodeId);

  // Uses the category provided by the backend.
  const currentCategory = nodeCategory || "Uncategorized";
  const isCategorized = Boolean(nodeCategory);

  // Description and data source stay unchanged until their backend routes exist.
  const sampleDetails = {
    description: "Giggle",
    dataSource: "DS xy",
  };

  function handleConfirm() {
    if (!selectedCategory) {
      return;
    }

    console.log("Dummy confirm:", {
      sampleId: nodeId,
      previousCategory: nodeCategory,
      selectedCategory,
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

        <div className="annotation-section">
          <h3 className="annotation-title">Annotation</h3>

          <div className="annotation-divider" />

          <div className="annotation-status-row">
            <span className="annotation-label">Current Status</span>

            <span
              className={`status-badge ${
                isCategorized ? "categorized" : "uncategorized"
              }`}
            >
              {isCategorized ? "Categorized" : "Uncategorized"}
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

          <div className="annotation-actions">
            <button
              type="button"
              className="confirm-btn"
              onClick={handleConfirm}
              disabled={!selectedCategory}
            >
              Confirm
            </button>

            <button type="button" className="next-btn" onClick={handleNext}>
              Next <span aria-hidden="true">▶</span>
            </button>
          </div>
        </div>
      </div>

      <AnomalyPopup
        node={node}
        isOpen={isAnomalyPopupOpen}
        onClose={closeAnomalyPopup}
      />
    </>
  );
}
