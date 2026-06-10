export const CLUSTER_COLORS: readonly string[] = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e91e63',
  '#cddc39',
];

export function getClusterColor(cluster: number): string {
  return CLUSTER_COLORS[cluster] ?? '#ffffff';
}
