// Cluster colors span a 3-stop gradient from orange through a soft violet
// to light blue, so categories read as a spectrum rather than a rainbow.
const GRADIENT_STOPS = [
  { r: 0xff, g: 0x84, b: 0x00 }, // --color-orange
  { r: 0x9b, g: 0x4f, b: 0xd6 }, // violet (midpoint)
  { r: 0x8f, g: 0xa0, b: 0xd8 }, // --color-light-blue
];

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0");
}

export function getClusterColor(
  cluster: number,
  totalClusters: number,
): string {
  const stops = GRADIENT_STOPS.length;

  if (totalClusters <= 1) {
    return "#ff8400";
  }

  const t = Math.min(Math.max(cluster / (totalClusters - 1), 0), 1);
  // Maps t (0..1) onto the segment between two adjacent stops.
  const segment = Math.min(Math.floor(t * (stops - 1)), stops - 2);
  const segmentT = t * (stops - 1) - segment;

  const from = GRADIENT_STOPS[segment];
  const to = GRADIENT_STOPS[segment + 1];
  const r = from.r + (to.r - from.r) * segmentT;
  const g = from.g + (to.g - from.g) * segmentT;
  const b = from.b + (to.b - from.b) * segmentT;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
