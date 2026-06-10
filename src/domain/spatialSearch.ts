import type { PointData } from './types';

export function knnSearch(points: PointData[], sourceId: string, k: number): string[] {
  const src = points.find(p => p.id === sourceId);
  if (!src) return [];

  const top: Array<{ id: string; d2: number }> = [];
  for (const p of points) {
    if (p.id === sourceId) continue;
    const d2 = (p.x - src.x) ** 2 + (p.y - src.y) ** 2;
    if (top.length < k) {
      top.push({ id: p.id, d2 });
      if (top.length === k) top.sort((a, b) => a.d2 - b.d2);
    } else if (d2 < top[k - 1].d2) {
      top[k - 1] = { id: p.id, d2 };
      for (let i = k - 1; i > 0 && top[i].d2 < top[i - 1].d2; i--) {
        [top[i], top[i - 1]] = [top[i - 1], top[i]];
      }
    }
  }
  return top.map(t => t.id);
}
