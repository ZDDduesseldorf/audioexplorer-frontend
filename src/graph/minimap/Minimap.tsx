import { useRef } from "react";
import type { PointData } from "../../domain/types";
import type { GraphEngine } from "../engine/GraphEngine";
import { useMinimapSync } from "./useMinimapSync";

interface MinimapProps {
  engine: GraphEngine | null;
  points: PointData[];
}

export function Minimap({ engine, points }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useMinimapSync(canvasRef, engine, points);
  return <canvas ref={canvasRef} className="minimap" />;
}
