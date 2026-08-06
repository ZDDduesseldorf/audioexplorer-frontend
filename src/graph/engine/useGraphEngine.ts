import { useEffect, useRef, useState } from "react";
import Graph from "graphology";
import Sigma from "sigma";
import type { PointData } from "../../domain/types";
import { getClusterColor } from "../../domain/clusters";
import type { GraphEngine } from "./GraphEngine";
import { SigmaEngineAdapter } from "./SigmaEngineAdapter";
import { playAudioByUuid, stopAudio } from "../../services/audioPlayerService";

interface GraphEngineCallbacks {
  onNodeClick?: (node: PointData) => void;
  onStageClick?: () => void;
  onHoverChange?: (
    nodeId: string | null,
    position: { x: number; y: number } | null,
  ) => void;
  onSelectedTooltipChange?: (
    nodeId: string | null,
    position: { x: number; y: number } | null,
  ) => void;
}

const HOVER_COLOR = "#F9DFC6";
const SELECTED_COLOR = "#F9DFC6";

// Delay before hover audio starts.
const HOVER_AUDIO_DELAY_MS = 150;

export function useGraphEngine(
  containerRef: React.RefObject<HTMLDivElement | null>,
  points: PointData[],
  nodeSize: number,
  selectedId: string | null,
  isHoverAudioEnabled: boolean,
  callbacks: GraphEngineCallbacks,
): GraphEngine | null {
  const [engine, setEngine] = useState<GraphEngine | null>(null);

  const nodeSizeRef = useRef(nodeSize);
  const selectedIdRef = useRef(selectedId);
  const hoveredIdRef = useRef<string | null>(null);

  // Stores the timer used to delay hover audio playback
  const hoverAudioTimerRef = useRef<number | null>(null);

  // stores whether hover audio is enabled
  const isHoverAudioEnabledRef = useRef(isHoverAudioEnabled);

  // Callback refs so Sigma event handlers always call the latest version
  const onNodeClickRef = useRef(callbacks.onNodeClick);
  const onStageClickRef = useRef(callbacks.onStageClick);
  const onHoverChangeRef = useRef(callbacks.onHoverChange);
  const onSelectedTooltipChangeRef = useRef(callbacks.onSelectedTooltipChange);

  useEffect(() => {
    onNodeClickRef.current = callbacks.onNodeClick;
  }, [callbacks.onNodeClick]);
  useEffect(() => {
    onStageClickRef.current = callbacks.onStageClick;
  }, [callbacks.onStageClick]);
  useEffect(() => {
    onHoverChangeRef.current = callbacks.onHoverChange;
  }, [callbacks.onHoverChange]);
  useEffect(() => {
    onSelectedTooltipChangeRef.current = callbacks.onSelectedTooltipChange;
  }, [callbacks.onSelectedTooltipChange]);

  // if hover auio gets disabled -> stop sounds
  useEffect(() => {
    isHoverAudioEnabledRef.current = isHoverAudioEnabled;

    if (!isHoverAudioEnabled) {
      if (hoverAudioTimerRef.current !== null) {
        window.clearTimeout(hoverAudioTimerRef.current);
        hoverAudioTimerRef.current = null;
      }
      stopAudio();
    }
  }, [isHoverAudioEnabled]);

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
      // We render our own React tooltip with label and coordinates.
      // Disable Sigma's default hover label to avoid duplicate tooltips.
      renderEdgeLabels: false,
      defaultDrawNodeHover: () => {},
      defaultNodeType: "circle",
      defaultEdgeType: "line",
      hideEdgesOnMove: true,
      enableEdgeEvents: false,
      zoomingRatio: 1.5,
      minCameraRatio: 0.02,
      maxCameraRatio: 10,
      nodeReducer: (node, data) => {
        const size = nodeSizeRef.current;

        if (node === selectedIdRef.current) {
          return {
            ...data,
            size,
            color: SELECTED_COLOR,
          };
        }

        if (node === hoveredIdRef.current) {
          return {
            ...data,
            size,
            color: HOVER_COLOR,
          };
        }

        return { ...data, size };
      },
    });

    const getNodeViewportPosition = (node: string) => {
      const nodeData = graph.getNodeAttributes(node) as {
        x: number;
        y: number;
      };

      return sigma.graphToViewport({
        x: nodeData.x,
        y: nodeData.y,
      });
    };

    const showHoverTooltipForNode = (node: string) => {
      onHoverChangeRef.current?.(node, getNodeViewportPosition(node));
    };

    const showSelectedTooltipForNode = (node: string) => {
      onSelectedTooltipChangeRef.current?.(node, getNodeViewportPosition(node));
    };

    const adapter = new SigmaEngineAdapter(sigma);

    const handleEnterNode = ({ node }: { node: string }) => {
      // stores current hovered node
      hoveredIdRef.current = node;
      showHoverTooltipForNode(node);

      // changes cursor to let user know that the node is also clickable
      sigma.getContainer().style.cursor = "pointer";
      sigma.refresh();

      // only starts hover audio when the mode is enabled
      if (!isHoverAudioEnabledRef.current) {
        return;
      }

      // cancels older timer if one still exists
      if (hoverAudioTimerRef.current !== null) {
        window.clearTimeout(hoverAudioTimerRef.current);
      }

      // starts the audio only when the mouse stays on the node for 150 ms
      hoverAudioTimerRef.current = window.setTimeout(() => {
        playAudioByUuid(node);
        hoverAudioTimerRef.current = null;
      }, HOVER_AUDIO_DELAY_MS);
    };

    const handleLeaveNode = () => {
      hoveredIdRef.current = null;

      onHoverChangeRef.current?.(null, null);

      sigma.getContainer().style.cursor = "default";

      // cancels the planned audio start when the mouse leaves too quickly
      if (hoverAudioTimerRef.current !== null) {
        window.clearTimeout(hoverAudioTimerRef.current);
        hoverAudioTimerRef.current = null;
      }

      // Stops the currently playing hover audio.
      if (isHoverAudioEnabledRef.current) {
        stopAudio();
      }

      sigma.refresh();
    };

    const handleClickNode = ({ node }: { node: string }) => {
      // stores selected node
      selectedIdRef.current = node;

      showSelectedTooltipForNode(node);

      // cancels hover playback before starting click playback
      if (hoverAudioTimerRef.current !== null) {
        window.clearTimeout(hoverAudioTimerRef.current);
        hoverAudioTimerRef.current = null;
      }

      const point = points.find((p) => p.id === node);

      // updates selected audio
      if (point) {
        onNodeClickRef.current?.(point);
      }

      // updates tooltip position
      requestAnimationFrame(() => {
        showSelectedTooltipForNode(node);
      });
    };

    const handleClickStage = () => {
      selectedIdRef.current = null;
      hoveredIdRef.current = null;

      onSelectedTooltipChangeRef.current?.(null, null);
      onHoverChangeRef.current?.(null, null);

      onStageClickRef.current?.();
    };

    const updateActiveTooltipPosition = () => {
      if (selectedIdRef.current) {
        showSelectedTooltipForNode(selectedIdRef.current);
      }

      if (hoveredIdRef.current) {
        showHoverTooltipForNode(hoveredIdRef.current);
      }
    };

    sigma.on("enterNode", handleEnterNode);
    sigma.on("leaveNode", handleLeaveNode);
    sigma.on("clickNode", handleClickNode);
    sigma.on("clickStage", handleClickStage);
    sigma.getCamera().on("updated", updateActiveTooltipPosition);

    setEngine(adapter);

    return () => {
      if (hoverAudioTimerRef.current !== null) {
        window.clearTimeout(hoverAudioTimerRef.current);
        hoverAudioTimerRef.current = null;
      }

      sigma.removeListener("enterNode", handleEnterNode);
      sigma.removeListener("leaveNode", handleLeaveNode);
      sigma.removeListener("clickNode", handleClickNode);
      sigma.removeListener("clickStage", handleClickStage);
      sigma.getCamera().removeListener("updated", updateActiveTooltipPosition);
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
