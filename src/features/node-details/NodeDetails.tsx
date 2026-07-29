import type { PointData } from "../../domain/types";
import { getAudioByUuid } from "../../services/audioPlayerService";
import { AudioWaveform } from "./AudioWaveform";
import { useAppStore } from "../../store/useAppStore";
import { useEffect, useMemo, useState } from "react";
import "./NodeDetails.css";

interface NodeDetailsProps {
  node: PointData | null;
}

/**
 * Anomaly values that FastAPI may add to each embedding point.
 * The type extension keeps NodeDetails compatible even when these fields
 * have not yet been added to the central PointData interface.
 */
type PointWithAnomalyScores = PointData & {
  anomalie_isolation_forest?: number | string | null;
  anomalie_lof?: number | string | null;
  anomalyIsolationForest?: number | string | null;
  anomalyLof?: number | string | null;
  isolationForest?: number | string | null;
  localOutlierFactor?: number | string | null;
};

function firstFiniteNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const parsedValue =
      typeof value === "string" ? Number.parseFloat(value) : value;

    if (typeof parsedValue === "number" && Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)}%`;
}

export function NodeDetails({ node }: NodeDetailsProps) {
  const clearSelection = useAppStore((state) => state.clearSelection);
  const points = useAppStore((state) => state.points);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Creates a list of all categories returned by the backend.
  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    points.forEach((point) => {
      const category = point.category?.trim();

      if (category) {
        categorySet.add(category);
      }
    });

    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
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
  const pointWithAnomalyScores = node as PointWithAnomalyScores;

  // Reads the values directly from the point returned by FastAPI.
  const isolationForestValue = firstFiniteNumber(
    pointWithAnomalyScores.anomalie_isolation_forest,
    pointWithAnomalyScores.anomalyIsolationForest,
    pointWithAnomalyScores.isolationForest,
  );

  const localOutlierFactorValue = firstFiniteNumber(
    pointWithAnomalyScores.anomalie_lof,
    pointWithAnomalyScores.anomalyLof,
    pointWithAnomalyScores.localOutlierFactor,
  );

  // Requests the audio file from the backend.
  const audioUrl = getAudioByUuid(nodeId);

  // Uses the category provided by the backend.
  const currentCategory = nodeCategory || "Uncategorized";
  const isCategorized = Boolean(nodeCategory);

  // Description and data source stay unchanged until their backend routes exist.
  const sampleDetails = {
    description: "Giggle",
    dataSource: "DS xy",
    isolationForest: formatPercentage(isolationForestValue),
    localOutlierFactor: formatPercentage(localOutlierFactorValue),
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

    // TODO: Save the selected category through the backend.
  }

  function handleNext() {
    console.log("Dummy next sample");

    // TODO: Select the next sample.
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Selected sample</h2>

        <button
          type="button"
          className="close-btn"
          onClick={clearSelection}
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

            <tr className="interactive-detail-row">
              <th scope="row">Isolation Forest</th>
              <td>{sampleDetails.isolationForest}</td>
            </tr>

            <tr className="interactive-detail-row">
              <th scope="row">Local Outlier Factor</th>
              <td>{sampleDetails.localOutlierFactor}</td>
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
  );
}
