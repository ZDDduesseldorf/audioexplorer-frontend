import type { PointData } from "../domain/types";

interface RawPoint {
  id: string | number;
  x: number;
  y: number;
  cluster: number;
  label: string;
}

export async function fetchAudioData(datasetId: string): Promise<PointData[]> {
  const res = await fetch(`/${datasetId}.json`);
  if (!res.ok)
    throw new Error(
      `Failed to load dataset "${datasetId}": HTTP ${res.status}`,
    );
  const raw = await res.json();
  return (raw.points as RawPoint[]).map((p) => ({ ...p, id: String(p.id) }));
}
