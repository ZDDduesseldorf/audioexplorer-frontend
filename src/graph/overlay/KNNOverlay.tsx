import { useEffect, useRef } from 'react';
import type { PointData } from '../../domain/types';
import type { GraphEngine } from '../engine/GraphEngine';
import { knnSearch } from '../../domain/spatialSearch';

const KNN_K = 10;

interface KNNOverlayProps {
  engine: GraphEngine | null;
  hoveredId: string | null;
  points: PointData[];
}

export function KNNOverlay({ engine, hoveredId, points }: KNNOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafPendingRef = useRef(false);
  const hoveredIdRef = useRef(hoveredId);

  useEffect(() => { hoveredIdRef.current = hoveredId; }, [hoveredId]);

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
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const id = hoveredIdRef.current;
      if (!id) return;

      const src = engine.graphToViewport(
        (() => { const p = points.find(x => x.id === id); return p ? { x: p.x, y: p.y } : { x: 0, y: 0 }; })()
      );

      const neighbors = knnSearch(points, id, KNN_K);
      ctx.strokeStyle = 'rgba(249,223,198,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const nid of neighbors) {
        const np = points.find(x => x.id === nid);
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

    engine.on('afterRender', schedule);
    schedule();
    return () => engine.off('afterRender', schedule);
  }, [engine, points]);

  // Redraw immediately when hover changes
  useEffect(() => {
    if (!engine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!hoveredId) return;

    const src = (() => { const p = points.find(x => x.id === hoveredId); return p ? engine.graphToViewport({ x: p.x, y: p.y }) : null; })();
    if (!src) return;

    const neighbors = knnSearch(points, hoveredId, KNN_K);
    ctx.strokeStyle = 'rgba(249,223,198,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const nid of neighbors) {
      const np = points.find(x => x.id === nid);
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
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  );
}
