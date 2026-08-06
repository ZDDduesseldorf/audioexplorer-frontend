import { useState, useRef, useEffect } from "react";
import "./AudioPlayerPanel.css";

interface AudioPoint {
    id: string | number;
    name?: string;
    filename?: string;
    category?: string;
    audioUrl?: string; // آدرس فایل صوتی اصلی
}

interface AudioPlayerPanelProps {
    point: AudioPoint | null;
    onClose: () => void;
}

export function AudioPlayerPanel({ point, onClose }: AudioPlayerPanelProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // با تغییر نود انتخابی، پخش‌کننده متوقف می‌شود
    useEffect(() => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [point]);

    if (!point) return null;

    // مسیر فایل صوتی (اگر در داده‌ها موجود باشد از آن استفاده می‌شود، در غیر این صورت از مسیر فرضی)
    const audioSource = point.audioUrl ?? `/audio/${point.filename ?? point.name}.wav`;

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((err) => {
                    console.error("خطا در پخش فایل صوتی:", err);
                    alert("فایل صوتی برای این نود یافت نشد یا قابل دسترس نیست.");
                });
        }
    };

    return (
        <div className="audio-player-panel">
            <div className="player-header">
                <span>🎵 Audio Player</span>
                <button onClick={onClose} className="close-btn">✕</button>
            </div>
            <div className="player-body">
                <p className="track-title">{point.filename ?? point.name ?? `Sound #${point.id}`}</p>

                {/* تگ صوتی HTML5 برای پخش واقعی صدا */}
                <audio
                    ref={audioRef}
                    src={audioSource}
                    onEnded={() => setIsPlaying(false)}
                    preload="none"
                />

                <div className="player-controls">
                    <button onClick={togglePlay} className="play-btn">
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                    </button>
                    <div className="audio-progress-bar">
                        <div className="progress-fill" style={{ width: isPlaying ? "100%" : "0%" }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}