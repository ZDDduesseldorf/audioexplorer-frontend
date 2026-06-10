import { useEffect, useRef } from "react";
import type { PointData } from "../../domain/types";
import { getClusterColor } from "../../domain/clusters";
import type { GraphEngine } from "../engine/GraphEngine";

const MINIMAP_MAX_SIDE = 180;
const MINIMAP_PAD = 8;

interface MinimapGeometry {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  bboxW: number;
  bboxH: number;
  mmW: number;
  mmH: number;
  scale: number;
}

function computeGeometry(points: PointData[]): MinimapGeometry {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const bboxW = maxX - minX || 1;
  const bboxH = maxY - minY || 1;
  const scale = Math.min(MINIMAP_MAX_SIDE / bboxW, MINIMAP_MAX_SIDE / bboxH);
  return {
    minX,
    maxX,
    minY,
    maxY,
    bboxW,
    bboxH,
    mmW: Math.round(bboxW * scale),
    mmH: Math.round(bboxH * scale),
    scale,
  };
}

export function useMinimapSync(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  engine: GraphEngine | null,
  points: PointData[],
) {
  const geoRef = useRef<MinimapGeometry | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  // Rebuild offscreen canvas when points change
  useEffect(() => {
    if (!canvasRef.current || !points.length) return;

    const geo = computeGeometry(points);
    geoRef.current = geo;
    const { minX, maxY, bboxW, bboxH, mmW, mmH } = geo;

    canvasRef.current.width = mmW + MINIMAP_PAD * 2;
    canvasRef.current.height = mmH + MINIMAP_PAD * 2;

    const dotRadius = Math.max(
      0.4,
      Math.min(1.5, 55 / Math.sqrt(points.length)),
    );
    const offscreen = document.createElement("canvas");
    offscreen.width = mmW;
    offscreen.height = mmH;
    offscreenRef.current = offscreen;
    const octx = offscreen.getContext("2d")!;

    const gToM = (gx: number, gy: number) => ({
      x: ((gx - minX) / bboxW) * mmW,
      y: ((maxY - gy) / bboxH) * mmH,
    });

    for (const p of points) {
      const { x, y } = gToM(p.x, p.y);
      octx.fillStyle = getClusterColor(p.cluster);
      octx.beginPath();
      octx.arc(x, y, dotRadius, 0, Math.PI * 2);
      octx.fill();
    }
  }, [canvasRef, points]);

  // Draw viewport rect on every afterRender
  useEffect(() => {
    if (!engine) return;

    const draw = () => {
      const canvas = canvasRef.current;
      const geo = geoRef.current;
      const offscreen = offscreenRef.current;
      if (!canvas || !geo || !offscreen) return;

      const { minX, maxY, bboxW, bboxH, mmW, mmH } = geo;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const gToM = (gx: number, gy: number) => ({
        x: ((gx - minX) / bboxW) * mmW,
        y: ((maxY - gy) / bboxH) * mmH,
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreen, MINIMAP_PAD, MINIMAP_PAD);

      const bounds = engine.getViewportBounds();
      const r0 = gToM(bounds.minX, bounds.minY);
      const r1 = gToM(bounds.maxX, bounds.maxY);

      const rxMin = Math.max(0, Math.min(r0.x, r1.x));
      const ryMin = Math.max(0, Math.min(r0.y, r1.y));
      const rxMax = Math.min(mmW, Math.max(r0.x, r1.x));
      const ryMax = Math.min(mmH, Math.max(r0.y, r1.y));
      const rw = rxMax - rxMin;
      const rh = ryMax - ryMin;

      if (rw > 0 && rh > 0) {
        const cx = rxMin + MINIMAP_PAD;
        const cy = ryMin + MINIMAP_PAD;
        ctx.fillStyle = "rgba(255,132,0,0.1)";
        ctx.fillRect(cx, cy, rw, rh);
        ctx.strokeStyle = "#FF8400";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx, cy, rw, rh);
      }
    };

    engine.on("afterRender", draw);
    draw();
    return () => engine.off("afterRender", draw);
  }, [canvasRef, engine]);

  // Click on minimap → pan camera
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    const handleClick = (e: MouseEvent) => {
      const geo = geoRef.current;
      if (!geo) return;
      const { minX, maxY, bboxW, bboxH, mmW, mmH } = geo;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left - MINIMAP_PAD;
      const py = e.clientY - rect.top - MINIMAP_PAD;
      if (px < 0 || py < 0 || px > mmW || py > mmH) return;
      const gx = minX + (px / mmW) * bboxW;
      const gy = maxY - (py / mmH) * bboxH;
      engine.panTo(gx, gy);
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [canvasRef, engine]);
}
