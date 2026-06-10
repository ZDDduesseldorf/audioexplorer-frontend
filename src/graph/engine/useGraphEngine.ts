import { useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import type { PointData } from '../../domain/types';
import { getClusterColor } from '../../domain/clusters';
import type { GraphEngine } from './GraphEngine';
import { SigmaEngineAdapter } from './SigmaEngineAdapter';

interface GraphEngineCallbacks {
  onNodeClick?: (node: PointData) => void;
  onStageClick?: () => void;
  onHoverChange?: (nodeId: string | null, position: { x: number; y: number } | null) => void;
}

const SELECTED_MULTIPLIER = 2.5;

export function useGraphEngine(
  containerRef: React.RefObject<HTMLDivElement | null>,
  points: PointData[],
  nodeSize: number,
  selectedId: string | null,
  callbacks: GraphEngineCallbacks
): GraphEngine | null {
  const [engine, setEngine] = useState<GraphEngine | null>(null);

  const nodeSizeRef = useRef(nodeSize);
  const selectedIdRef = useRef(selectedId);

  // Callback refs so Sigma event handlers always call the latest version
  const onNodeClickRef = useRef(callbacks.onNodeClick);
  const onStageClickRef = useRef(callbacks.onStageClick);
  const onHoverChangeRef = useRef(callbacks.onHoverChange);

  useEffect(() => { onNodeClickRef.current = callbacks.onNodeClick; }, [callbacks.onNodeClick]);
  useEffect(() => { onStageClickRef.current = callbacks.onStageClick; }, [callbacks.onStageClick]);
  useEffect(() => { onHoverChangeRef.current = callbacks.onHoverChange; }, [callbacks.onHoverChange]);

  // Build graph + Sigma once when points arrive
  useEffect(() => {
    if (!containerRef.current || !points.length) return;

    const graph = new Graph();
    for (const p of points) {
      graph.addNode(p.id, {
        x: p.x,
        y: p.y,
        color: getClusterColor(p.cluster),
        label: p.label,
      });
    }

    const sigma = new Sigma(graph, containerRef.current, {
      renderLabels: false,
      defaultNodeType: 'circle',
      defaultEdgeType: 'line',
      hideEdgesOnMove: true,
      enableEdgeEvents: false,
      zoomingRatio: 1.5,
      minCameraRatio: 0.02,
      maxCameraRatio: 10,
      nodeReducer: (node, data) => {
        const size = nodeSizeRef.current;
        if (node === selectedIdRef.current) {
          return { ...data, size: size * SELECTED_MULTIPLIER, color: '#FF8400' };
        }
        return { ...data, size };
      },
    });

    const adapter = new SigmaEngineAdapter(sigma);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const on = (event: string, handler: (...args: any[]) => void) => sigma.on(event as any, handler);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const off = (event: string, handler: (...args: any[]) => void) => sigma.removeListener(event as any, handler);

    const handleEnterNode = ({ node, event }: { node: string; event: { x: number; y: number; original: MouseEvent | TouchEvent } }) => {
      onHoverChangeRef.current?.(node, { x: event.x, y: event.y });
      sigma.getContainer().style.cursor = 'pointer';
    };

    const handleLeaveNode = () => {
      onHoverChangeRef.current?.(null, null);
      sigma.getContainer().style.cursor = 'default';
    };

    const handleClickNode = ({ node }: { node: string }) => {
      const point = points.find(p => p.id === node);
      if (point) onNodeClickRef.current?.(point);
    };

    const handleClickStage = () => {
      onStageClickRef.current?.();
    };

    on('enterNode', handleEnterNode);
    on('leaveNode', handleLeaveNode);
    on('clickNode', handleClickNode);
    on('clickStage', handleClickStage);

    setEngine(adapter);

    return () => {
      off('enterNode', handleEnterNode);
      off('leaveNode', handleLeaveNode);
      off('clickNode', handleClickNode);
      off('clickStage', handleClickStage);
      adapter.destroy();
      setEngine(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // Sync nodeSize without rebuilding
  useEffect(() => {
    nodeSizeRef.current = nodeSize;
    engine?.refresh();
  }, [nodeSize, engine]);

  // Sync selectedId without rebuilding
  useEffect(() => {
    selectedIdRef.current = selectedId;
    engine?.refresh();
  }, [selectedId, engine]);

  return engine;
}
