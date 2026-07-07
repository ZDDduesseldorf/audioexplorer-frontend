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

function drawNeighborLines(
  ctx: CanvasRenderingContext2D,
  engine: GraphEngine,
  points: PointData[],
  id: string,
) {
  const src = points.find((x) => x.id === id);
  if (!src) return;

  const srcPos = engine.graphToViewport({ x: src.x, y: src.y });

  ctx.strokeStyle = "rgba(249,223,198,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const nid of nearestNeighborIds(src, KNN_K)) {
    const np = points.find((x) => x.id === nid);
    if (!np) continue;
    const tgt = engine.graphToViewport({ x: np.x, y: np.y });
    ctx.moveTo(srcPos.x, srcPos.y);
    ctx.lineTo(tgt.x, tgt.y);
  }
  ctx.stroke();
}

interface KNNOverlayProps {
  engine: GraphEngine | null;
  hoveredId: string | null;
  selectedId: string | null;
  points: PointData[];
}

// Draws neighbor lines for the selected node (persistent until the
// selection changes) and the hovered node (while hovering).
export function KNNOverlay({
  engine,
  hoveredId,
  selectedId,
  points,
}: KNNOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafPendingRef = useRef(false);
  const hoveredIdRef = useRef(hoveredId);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
    selectedIdRef.current = selectedId;
  }, [hoveredId, selectedId]);

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

      const selected = selectedIdRef.current;
      const hovered = hoveredIdRef.current;
      if (selected) drawNeighborLines(ctx, engine, points, selected);
      if (hovered && hovered !== selected)
        drawNeighborLines(ctx, engine, points, hovered);
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

  // Redraw immediately when hover or selection changes
  useEffect(() => {
    if (!engine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedId) drawNeighborLines(ctx, engine, points, selectedId);
    if (hoveredId && hoveredId !== selectedId)
      drawNeighborLines(ctx, engine, points, hoveredId);
  }, [hoveredId, selectedId, engine, points]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
