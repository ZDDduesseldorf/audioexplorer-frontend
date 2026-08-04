import type { PointData } from "../domain/types";

// Switch the data source here:
// "api" loads data from the backend.
// "json" loads data from a static frontend JSON file.
const DATA_SOURCE: "api" | "json" = "api";

// An empty base URL uses the Vite development proxy.
const API_BASE_URL = "";

/**
 * Shape of a point in the optional static frontend JSON file.
 */
interface RawPoint {
  id: string | number;
  x: number;
  y: number;
  z?: number;
  cluster: number;
  label: string;
  category?: string;
  filename?: string;
  nearestNeighbors?: Record<string, number>;

  anomalie_isolation_forest?: number | null;
  anomalie_lof?: number | null;
  anomalie_isolation_forest_label?: string | null;
  anomalie_lof_label?: string | null;
}

/**
 * Exact response shape of GET /api/v1/sounds/overviews.
 *
 * The backend API uses uppercase `LOF` in these field names:
 * - anomalie_LOF
 * - anomalie_LOF_label
 *
 * They are normalized once in fetchFromApi() so that the rest of the
 * frontend only works with the lowercase PointData field names.
 */
interface SoundOverview {
  uuid: string;
  umap_x: number;
  umap_y: number;
  umap_z: number;
  label: string;
  category: string;
  filename: string;
  source: string;
  additional_information: Record<string, string>;

  anomalie_isolation_forest: number;
  anomalie_LOF: number;

  anomalie_isolation_forest_label: string;
  anomalie_LOF_label: string;

  nearest_neighbors: Record<string, number>;
}

/**
 * Loads the optional static frontend dataset.
 *
 * Missing anomaly values and labels are converted to null so every returned
 * point has the complete PointData shape.
 */
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

  return raw.points.map((point): PointData => ({
    ...point,
    id: String(point.id),

    anomalie_isolation_forest: point.anomalie_isolation_forest ?? null,

    anomalie_lof: point.anomalie_lof ?? null,

    anomalie_isolation_forest_label:
      point.anomalie_isolation_forest_label ?? null,

    anomalie_lof_label: point.anomalie_lof_label ?? null,
  }));
}

/**
 * Loads sound overviews from the backend and converts the API response into
 * the single PointData shape used throughout the frontend.
 */
async function fetchFromApi(): Promise<PointData[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sounds/overviews`);

  if (!response.ok) {
    throw new Error(`Failed to load sound overviews: HTTP ${response.status}`);
  }

  const raw = (await response.json()) as SoundOverview[];

  // Creates a stable numeric cluster index for every category.
  const categories = [...new Set(raw.map((point) => point.category))].sort(
    (firstCategory, secondCategory) =>
      firstCategory.localeCompare(secondCategory),
  );

  const clusterByCategory = new Map(
    categories.map((category, index) => [category, index]),
  );

  return raw.map((point): PointData => ({
    id: point.uuid,

    x: Number(point.umap_x),
    y: Number(point.umap_y),
    z: Number(point.umap_z),

    cluster: clusterByCategory.get(point.category) ?? 0,

    label: point.label,
    category: point.category,
    filename: point.filename,

    nearestNeighbors: point.nearest_neighbors ?? {},

    // The Isolation Forest names already match the frontend shape.
    anomalie_isolation_forest: point.anomalie_isolation_forest,

    anomalie_isolation_forest_label: point.anomalie_isolation_forest_label,

    // Normalize the backend's uppercase LOF names once at the fetch boundary.
    anomalie_lof: point.anomalie_LOF,
    anomalie_lof_label: point.anomalie_LOF_label,
  }));
}

export async function fetchAudioData(datasetId: string): Promise<PointData[]> {
  return DATA_SOURCE === "api" ? fetchFromApi() : fetchFromJson(datasetId);
}

// Labels a sample with a category via the backend.
export async function createLabeledSample(
  uuid: string,
  category: string,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/sounds/labeled-samples`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uuid, category }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");

    throw new Error(
      `Failed to label sample "${uuid}": HTTP ${res.status}${detail ? ` – ${detail}` : ""}`,
    );
  }
}
