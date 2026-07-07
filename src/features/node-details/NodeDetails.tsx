import type { PointData } from "../../domain/types";
import { getClusterColor } from "../../domain/clusters";
import { getAudioByUuid } from "../../services/audioPlayerService";
import { AudioWaveform } from "./AudioWaveform";
import { useAppStore } from "../../store/useAppStore";

interface NodeDetailsProps {
  node: PointData | null;
}

export function NodeDetails({ node }: NodeDetailsProps) {
  const clearSelection = useAppStore((s) => s.clearSelection);

  if (!node) return null;

  const clusterColor = getClusterColor(node.cluster);

  // request files from backend for wavesurfer
  const audioUrl = getAudioByUuid(node.id);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Point Details</h2>
        <button
          className="close-btn"
          onClick={clearSelection}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <div className="audio-player">
        <AudioWaveform audioUrl={audioUrl} />
      </div>

      <div className="sidebar-section">
        <div className="detail-row">
          <span className="detail-label">ID</span>
          <span className="detail-value">#{node.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Label</span>
          <span className="detail-value">{node.label}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">X</span>
          <span className="detail-value">{node.x.toFixed(3)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Y</span>
          <span className="detail-value">{node.y.toFixed(3)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Cluster</span>
          <span
            className="detail-value cluster-badge"
            style={{ backgroundColor: clusterColor }}
          >
            {node.cluster}
          </span>
        </div>
      </div>
      <div className="annotation-section">
        <div className="annotation-divider" />
        <h3 className="annotation-title">Annotation</h3>
        <div className="annotation-divider" />
      </div>
    </div>
  );
}
