export interface PointData {
  id: string;
  x: number;
  y: number;
  cluster: number;
  label: string;

  // Only present when loading from the API.
  z?: number;
  category?: string;
  filename?: string;
  dataSource?: string | null;

  // Neighbor id -> distance, precomputed by the backend.
  nearestNeighbors?: Record<string, number>;

  // anomaly score fields used throughout the frontend.
  anomalie_isolation_forest: number | null;
  anomalie_lof: number | null;

  // anomaly labels
  anomalie_isolation_forest_label: string | null;
  anomalie_lof_label: string | null;
}
