import type { PointData } from "../domain/types";

// Switch the data source here: "api" loads from the backend,
// "json" uses the static JSON file.
const DATA_SOURCE: "api" | "json" = "api";

// Empty string uses the Vite dev proxy (/api -> localhost:8000).
const API_BASE_URL = "";

type AnomalyValue = number | string | null;

interface AnomalyFields {
  anomalie_isolation_forest?: AnomalyValue;

  // The database/API may use either spelling.
  anomalie_lof?: AnomalyValue;
  anomalie_LOF?: AnomalyValue;
}

interface RawPoint extends AnomalyFields {
  id: string | number;
  x: number;
  y: number;
  cluster: number;
  label: string;
  category?: string;
  filename?: string;
  nearestNeighbors?: Record<string, number>;
}

interface SoundOverview extends AnomalyFields {
  uuid: string;
  umap_x: number;
  umap_y: number;
  umap_z: number;
  label: string;
  category: string;

  // Depending on the backend response, one of these names may be used.
  filename?: string;
  original_filename?: string;

  anomalie?: boolean | null;
  nearest_neighbors?: Record<string, number>;
}

/**
 * Normalizes the anomaly field names used by the backend.
 *
 * The backend currently uses:
 * - anomalie_isolation_forest
 * - anomalie_lof or anomalie_LOF
 *
 * NodeDetails always receives:
 * - anomalie_isolation_forest
 * - anomalie_lof
 */
function getAnomalyFields(point: AnomalyFields): {
  anomalie_isolation_forest: AnomalyValue;
  anomalie_lof: AnomalyValue;
} {
  return {
    anomalie_isolation_forest: point.anomalie_isolation_forest ?? null,

    anomalie_lof: point.anomalie_lof ?? point.anomalie_LOF ?? null,
  };
}

async function fetchFromJson(datasetId: string): Promise<PointData[]> {
  const response = await fetch(`/${datasetId}.json`);

  if (!response.ok) {
    throw new Error(
      `Failed to load dataset "${datasetId}": HTTP ${response.status}`,
    );
  }

  const raw = (await response.json()) as {
    points: RawPoint[];
  };

  return raw.points.map((point) => ({
    ...point,
    id: String(point.id),

    ...getAnomalyFields(point),
  }));
}

async function fetchFromApi(): Promise<PointData[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sounds/overviews`);

  if (!response.ok) {
    throw new Error(`Failed to load sound overviews: HTTP ${response.status}`);
  }

  const raw = (await response.json()) as SoundOverview[];

  // Stable numeric cluster index per category, used for coloring.
  const categories = [...new Set(raw.map((point) => point.category))].sort(
    (firstCategory, secondCategory) =>
      firstCategory.localeCompare(secondCategory),
  );

  const clusterByCategory = new Map(
    categories.map((category, index) => [category, index]),
  );

  return raw.map((point) => ({
    id: point.uuid,
    x: Number(point.umap_x),
    y: Number(point.umap_y),
    z: Number(point.umap_z),

    cluster: clusterByCategory.get(point.category) ?? 0,

    label: point.label,
    category: point.category,

    filename: point.filename ?? point.original_filename,

    nearestNeighbors: point.nearest_neighbors ?? {},

    ...getAnomalyFields(point),
  }));
}

export async function fetchAudioData(datasetId: string): Promise<PointData[]> {
  return DATA_SOURCE === "api" ? fetchFromApi() : fetchFromJson(datasetId);
}
