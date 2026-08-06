import type { PointData } from "../domain/types";

// Switch the data source here: "api" loads from the backend,
// "json" uses the static JSON file.
const DATA_SOURCE: "api" | "json" = "api";

// Empty string uses the Vite dev proxy (/api -> localhost:8000).
const API_BASE_URL = "";

interface RawPoint {
  id: string | number;
  x: number;
  y: number;
  cluster: number;
  label: string;

  // Static JSON files use the normalized frontend field names.
  anomalie_isolation_forest?: number | null;
  anomalie_lof?: number | null;
  anomalie_isolation_forest_label?: string | null;
  anomalie_lof_label?: string | null;
}

interface SoundOverview {
  uuid: string;
  umap_x: number;
  umap_y: number;
  umap_z: number;
  label: string;
  category: string;
  filename: string;
  nearest_neighbors: Record<string, number>;
  original_filename: string;
  source: string | null;

  // Anomaly fields returned by the backend.
  anomalie_isolation_forest: number | null;
  anomalie_LOF: number | null;
  anomalie_isolation_forest_label: string | null;
  anomalie_LOF_label: string | null;
}

async function fetchFromJson(datasetId: string): Promise<PointData[]> {
  const res = await fetch(`/${datasetId}.json`);

  if (!res.ok) {
    throw new Error(
      `Failed to load dataset "${datasetId}": HTTP ${res.status}`,
    );
  }

  const raw = await res.json();

  return (raw.points as RawPoint[]).map((p) => ({
    ...p,
    id: String(p.id),

    // Ensure that static data also matches the complete PointData shape.
    anomalie_isolation_forest: p.anomalie_isolation_forest ?? null,
    anomalie_lof: p.anomalie_lof ?? null,
    anomalie_isolation_forest_label: p.anomalie_isolation_forest_label ?? null,
    anomalie_lof_label: p.anomalie_lof_label ?? null,
  }));
}

async function fetchFromApi(): Promise<PointData[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/sounds/overviews`);

  if (!res.ok) {
    throw new Error(`Failed to load sound overviews: HTTP ${res.status}`);
  }

  const raw = (await res.json()) as SoundOverview[];

  // Stable numeric cluster index per category, used for coloring.
  const categories = [...new Set(raw.map((p) => p.category))].sort();
  const clusterByCategory = new Map(categories.map((c, i) => [c, i]));

  return raw.map((p) => ({
    id: p.uuid,
    x: p.umap_x,
    y: p.umap_y,
    z: p.umap_z,
    cluster: clusterByCategory.get(p.category) ?? 0,
    label: p.label,
    category: p.category,
    filename: p.original_filename,
    dataSource: p.source ?? null,
    nearestNeighbors: p.nearest_neighbors,

    // Normalize the backend field names once at the API boundary.
    anomalie_isolation_forest: p.anomalie_isolation_forest,
    anomalie_lof: p.anomalie_LOF,
    anomalie_isolation_forest_label: p.anomalie_isolation_forest_label,
    anomalie_lof_label: p.anomalie_LOF_label,
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
