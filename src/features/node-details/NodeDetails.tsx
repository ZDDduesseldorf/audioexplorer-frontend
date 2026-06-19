import type { PointData } from "../../domain/types";
import { getClusterColor } from "../../domain/clusters";
import {playAudioByUuid, stopAudio } from "../../services/audioPlayerService";
import { useEffect, useState } from "react";


interface NodeDetailsProps {
  node: PointData | null;
  onClose: () => void;
}

export function NodeDetails({ node, onClose }: NodeDetailsProps) {
  // tracks if audio button show play or stop state
  const [isPlaying, setIsPlaying] = useState(false);
  if (!node) return null;

  // audio id used to requests the file from backend
  const nodeId = node.id;
  const clusterColor = getClusterColor(node.cluster);

  useEffect (() => {
    stopAudio;
    setIsPlaying(false);
  }, [nodeId]);

  // starts audio from selected node and updates button state
  function StartAudioPlayback() {
    playAudioByUuid(nodeId);
    setIsPlaying(true);
  }

  // stops audio from selected node and resets button state
  function StopAudioPlayback() {
    stopAudio();
    setIsPlaying(false);
  }

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

      <div className="audio-player">
        <button 
          className="audio-button" 
          onClick={isPlaying ? StopAudioPlayback : StartAudioPlayback}
          aria-label={isPlaying ? "Stop audio" : "Play audio"}
          >
            {isPlaying ? "■" : "▶" }
        </button>

        <span className="audio-time">00:00</span>

        {/* TODO maybe add a wavefrom instead of this */}
        <div className="audio-dummy-waveform">
          {[26, 15, 47, 26, 41, 20, 26, 58, 10, 50].map((height, index) => (
          <span 
            key={index}
            className="audio-dummy-waveform-bar"
            style={{height: `${height}px`}}
          />
          ))}
        </div>
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
