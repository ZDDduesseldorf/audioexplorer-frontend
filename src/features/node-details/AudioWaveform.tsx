import { useWavesurfer } from "@wavesurfer/react";
import { useEffect, useRef, useState } from "react";
import { getAudioPlayer } from "../../services/audioPlayerService";
import "./AudioWaveform.css";

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

    // Stores the audio length after the file has loaded
    const unsubscribeReady = wavesurfer.on("ready", (loadedDuration) => {
      setDuration(loadedDuration);
    });

    return () => {
      unsubscribeReady();
    };
  }, [wavesurfer]);

  // Starts or pauses the audio player
  function handlePlayPause(): void {
    if (!wavesurfer) return;

    // Restarts the sample when playback has already finished
    if (duration > 0 && currentTime >= duration - 0.01) {
      wavesurfer.seekTo(0);
    }

    void wavesurfer.playPause().catch((error: unknown) => {
      console.error("Audio could not be played", error);
    });
  }

  // Converts seconds into MM:SS,T.
  function formatTime(seconds: number): string {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;

    const totalCentiseconds = Math.floor(safeSeconds * 100);

    const minutes = Math.floor(totalCentiseconds / 6000);
    const wholeSeconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;

    return `${minutes.toString().padStart(2, "0")}:${wholeSeconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <button className="audio-button" onClick={handlePlayPause}>
        {isPlaying ? "■" : "▶"}
      </button>

      <span className="audio-time">
        {formatTime(
          duration > 0 && currentTime >= duration - 0.01
            ? duration
            : currentTime,
        )}
      </span>

      <div className="audio-waveform">
        <div ref={containerRef} className="wavesurfer-container" />
      </div>
    </>
  );
}
