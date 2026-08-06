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
}

interface SoundOverview {
  uuid: string;
  umap_x: number;
  umap_y: number;
  umap_z: number;
  label: string;
  category: string;
  filename: string;
  anomalie: boolean | null;
  nearest_neighbors: Record<string, number>;
}

async function fetchFromJson(datasetId: string): Promise<PointData[]> {
  const res = await fetch(`/${datasetId}.json`);
  if (!res.ok)
    throw new Error(
      `Failed to load dataset "${datasetId}": HTTP ${res.status}`,
    );
  const raw = await res.json();
  return (raw.points as RawPoint[]).map((p) => ({ ...p, id: String(p.id) }));
}

async function fetchFromApi(): Promise<PointData[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/sounds/overviews`);
  if (!res.ok)
    throw new Error(`Failed to load sound overviews: HTTP ${res.status}`);
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
    filename: p.filename,
    anomalie: p.anomalie,
    nearestNeighbors: p.nearest_neighbors,
  }));
}

export async function fetchAudioData(datasetId: string): Promise<PointData[]> {
  return DATA_SOURCE === "api" ? fetchFromApi() : fetchFromJson(datasetId);
}
