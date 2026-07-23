import { useWavesurfer } from "@wavesurfer/react";
import { useEffect, useRef, useState } from "react";
import { getAudioPlayer } from "../../services/audioPlayerService";

interface AudioWaveformProps {
  audioUrl: string;
}

const audioPlayer = getAudioPlayer();

export function AudioWaveform({ audioUrl }: AudioWaveformProps) {
  // container where wavesurfer renders waveform
  const containerRef = useRef<HTMLDivElement | null>(null);

  // stores the total length of the selected audio
  const [duration, setDuration] = useState(0);

  // creates wavesurfer instance for selected audios
  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,

    media: audioPlayer,
    url: audioUrl,

    // starts the selected sample after loading
    autoplay: true,

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

    // stores the audio length after the file has loaded
    const unsubscribeReady = wavesurfer.on("ready", (loadedDuration) => {
      setDuration(loadedDuration);
    });

    // resets playback to the beginning after the audio finishes
    const unsubscribeFinish = wavesurfer.on("finish", () => {
      wavesurfer.seekTo(0);
    });

    return () => {
      unsubscribeReady();
      unsubscribeFinish();
    };
  }, [wavesurfer]);

  // starts or pauses audio player
  function handlePlayPause(): void {
    if (!wavesurfer) return;

    void wavesurfer.playPause().catch((error: unknown) => {
      console.error("Audio could not be played", error);
    });
  }

  // converts seconds into mm:ss:SSS
  function formatTime(seconds: number): string {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;

    const minutes = Math.floor(safeSeconds / 60);
    const wholeSeconds = Math.floor(safeSeconds % 60);
    const milliseconds = Math.floor((safeSeconds % 1) * 1000);

    return [
      minutes.toString().padStart(2, "0"),
      wholeSeconds.toString().padStart(2, "0"),
      milliseconds.toString().padStart(3, "0"),
    ].join(":");
  }

  // shows the full audio length before playback starts and during playback it shows the current position
  const displayedTime = currentTime > 0 ? currentTime : duration;

  return (
    <>
      <button className="audio-button" onClick={handlePlayPause}>
        {isPlaying ? "■" : "▶"}
      </button>

      <span className="audio-time">{formatTime(displayedTime)}</span>

      <div className="audio-waveform">
        <div ref={containerRef} className="wavesurfer-container" />
      </div>
    </>
  );
}
