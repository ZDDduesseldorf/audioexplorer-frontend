import { useWavesurfer } from "@wavesurfer/react";
import { useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
  audioUrl: string;
}

export function AudioWaveform({ audioUrl }: AudioWaveformProps) {
  // container where wavesurfer renders waveform
  const containerRef = useRef<HTMLDivElement | null>(null);

  // stores current playback time
  const [currentTime, setCurrentTime] = useState(0);

  // creates wavesurfer instance for selected audios
  const { wavesurfer, isPlaying } = useWavesurfer({
    container: containerRef,
    url: audioUrl,

    // waveform layout
    height: 30,
    waveColor: "#0b0829",
    progressColor: "#ff8400",
    cursorColor: "transparent",
    barWidth: 4,
    barGap: 3,
    barRadius: 2,
    normalize: true,
  });

  useEffect(() => {
    if (!wavesurfer) return;

    // resets time when a new audio file is selected
    setCurrentTime(0);

    // updates time while audio is playing
    const unsubscribeAudioProcess = wavesurfer.on("audioprocess", (time) => {
      setCurrentTime(time);
    });

    // updates time when user clicks into the waveform
    const unsubscribeSeeking = wavesurfer.on("seeking", (time) => {
      setCurrentTime(time);
    });

    // resets time when audio finished
    const unsubscribeFinish = wavesurfer.on("finish", () => {
      setCurrentTime(0);
      wavesurfer.seekTo(0);
    });

    return () => {
      unsubscribeAudioProcess();
      unsubscribeSeeking();
      unsubscribeFinish();
    };
  }, [wavesurfer]);

  // starts or pauses audio playback
  function handlePlayPause() {
    wavesurfer?.playPause();
  }

  // seconds into mm:ss
  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <button
        className="audio-button"
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Stop audio" : "Play audio"}
      >
        {isPlaying ? "■" : "▶"}
      </button>

      <span className="audio-time">{formatTime(currentTime)}</span>

      <div className="audio-waveform">
        <div ref={containerRef} className="wavesurfer-container" />
      </div>
    </>
  );
}
