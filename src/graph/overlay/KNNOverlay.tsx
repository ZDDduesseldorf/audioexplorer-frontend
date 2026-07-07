import { useEffect, useRef } from "react";
import type { PointData } from "../../domain/types";
import type { GraphEngine } from "../engine/GraphEngine";

const KNN_K = 10;

// The k nearest neighbor ids of a point, taken from the
// backend-precomputed id -> distance map.
function nearestNeighborIds(point: PointData, k: number): string[] {
  if (!point.nearestNeighbors) return [];
  return Object.entries(point.nearestNeighbors)
    .sort(([, a], [, b]) => a - b)
    .slice(0, k)
    .map(([id]) => id);
}

interface KNNOverlayProps {
  engine: GraphEngine | null;
  hoveredId: string | null;
  points: PointData[];
}

export function KNNOverlay({ engine, hoveredId, points }: KNNOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafPendingRef = useRef(false);
  const hoveredIdRef = useRef(hoveredId);

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Draw KNN lines on every afterRender
  useEffect(() => {
    if (!engine) return;

    const draw = () => {
      rafPendingRef.current = false;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const id = hoveredIdRef.current;
      if (!id) return;

      const hovered = points.find((x) => x.id === id);
      if (!hovered) return;

      const src = engine.graphToViewport({ x: hovered.x, y: hovered.y });

      const neighbors = nearestNeighborIds(hovered, KNN_K);
      ctx.strokeStyle = "rgba(249,223,198,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const nid of neighbors) {
        const np = points.find((x) => x.id === nid);
        if (!np) continue;
        const tgt = engine.graphToViewport({ x: np.x, y: np.y });
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
      }
      ctx.stroke();
    };

    const schedule = () => {
      if (rafPendingRef.current) return;
      rafPendingRef.current = true;
      requestAnimationFrame(draw);
    };

    engine.on("afterRender", schedule);
    schedule();
    return () => engine.off("afterRender", schedule);
  }, [engine, points]);

  // Redraw immediately when hover changes
  useEffect(() => {
    if (!engine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!hoveredId) return;

    const hovered = points.find((x) => x.id === hoveredId);
    if (!hovered) return;

    const src = engine.graphToViewport({ x: hovered.x, y: hovered.y });

    const neighbors = nearestNeighborIds(hovered, KNN_K);
    ctx.strokeStyle = "rgba(249,223,198,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const nid of neighbors) {
      const np = points.find((x) => x.id === nid);
      if (!np) continue;
      const tgt = engine.graphToViewport({ x: np.x, y: np.y });
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
    }
    ctx.stroke();
  }, [hoveredId, engine, points]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
