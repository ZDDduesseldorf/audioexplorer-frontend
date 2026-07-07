export interface PointData {
  id: string;
  x: number;
  y: number;
  cluster: number;
  label: string;
  // Only present when loading from the API (VITE_DATA_SOURCE=api).
  z?: number;
  category?: string;
  filename?: string;
  anomalie?: boolean | null;
  // Neighbor id -> distance, precomputed by the backend.
  nearestNeighbors?: Record<string, number>;
}
