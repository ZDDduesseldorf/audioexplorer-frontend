import type { PointData } from "../../domain/types";
import { getClusterColor } from "../../domain/clusters";

interface NodeDetailsProps {
  node: PointData | null;
  onClose: () => void;
}

export function NodeDetails({ node, onClose }: NodeDetailsProps) {
  if (!node) return null;

  const clusterColor = getClusterColor(node.cluster);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Point Details</h2>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
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
