// Cluster colors span a gradient from orange to light blue (the app's two
// accent colors) instead of a set of unrelated hues, so categories read as
// a spectrum rather than a rainbow.
const GRADIENT_START = { r: 0xff, g: 0x84, b: 0x00 }; // --color-orange
const GRADIENT_END = { r: 0x8f, g: 0xa0, b: 0xd8 }; // --color-light-blue

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0");
}

export function getClusterColor(cluster: number, totalClusters: number): string {
  if (totalClusters <= 1) {
    return "#ff8400";
  }

  const t = Math.min(Math.max(cluster / (totalClusters - 1), 0), 1);
  const r = GRADIENT_START.r + (GRADIENT_END.r - GRADIENT_START.r) * t;
  const g = GRADIENT_START.g + (GRADIENT_END.g - GRADIENT_START.g) * t;
  const b = GRADIENT_START.b + (GRADIENT_END.b - GRADIENT_START.b) * t;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
