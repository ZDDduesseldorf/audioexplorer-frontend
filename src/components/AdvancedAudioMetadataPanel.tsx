import "./AdvancedAudioMetadataPanel.css";

interface AudioPoint {
    id: string | number;
    name?: string;
    filename?: string;
    category?: string;
    cluster?: number;
    duration?: number;
    sampleRate?: number;
}

interface AdvancedAudioMetadataPanelProps {
    point: AudioPoint | null;
    onClose: () => void;
}

export function AdvancedAudioMetadataPanel({ point, onClose }: AdvancedAudioMetadataPanelProps) {
    if (!point) return null;

    const handleCopyMetadata = () => {
        const textToCopy = JSON.stringify(point, null, 2);
        navigator.clipboard.writeText(textToCopy);
        alert("Datei-Metadaten wurden in die Zwischenablage kopiert");
    };

    return (
        <div className="audio-meta-panel">
            <div className="audio-meta-header">
                <h3>🔍 Advanced Audio Metadata</h3>
                <button type="button" className="audio-meta-close" onClick={onClose}>✕</button>
            </div>

            <div className="audio-meta-body">
                <div className="meta-item">
                    <span className="meta-label">File Name:</span>
                    <span className="meta-value">{point.filename ?? point.name ?? `Sound Node #${point.id}`}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Category / Cluster:</span>
                    <span className="meta-value" style={{ color: "#ff7a00" }}>{point.category ?? "Uncategorized"}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Duration:</span>
                    <span className="meta-value">{point.duration ? `${point.duration}s` : "4.2s (Estimated)"}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Sample Rate:</span>
                    <span className="meta-value">{point.sampleRate ? `${point.sampleRate} Hz` : "44,100 Hz"}</span>
                </div>

                <div className="waveform-preview-container">
                    <span className="meta-label" style={{ marginBottom: "6px", display: "block" }}>Waveform Preview:</span>
                    <div className="waveform-bars">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div
                                key={i}
                                className="waveform-bar"
                                style={{ height: `${Math.max(15, Math.sin(i * 0.5) * 40 + Math.random() * 25)}px` }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                    <button
                        type="button"
                        onClick={handleCopyMetadata}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            color: '#ff7a00',
                            border: '1px solid rgba(255, 122, 0, 0.4)',
                            padding: '10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        📋Datei-Info kopieren
                    </button>
                </div>
            </div>
        </div>
    );
}