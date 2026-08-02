import { useEffect, useState } from "react";
import { fetchAudioData } from "../services/audioDataService";
import { useAppStore } from "../store/useAppStore";

interface AudioDataState {
  loading: boolean;
  error: Error | null;
}

// Fetches the dataset and puts it into the global store.
export function useAudioData(datasetId: string): AudioDataState {
  const setPoints = useAppStore((state) => state.setPoints);

  const [state, setState] = useState<AudioDataState>({
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    setPoints([]);
    setState({
      loading: true,
      error: null,
    });

    fetchAudioData(datasetId)
      .then((points) => {
        if (isCancelled) {
          return;
        }

        setPoints(points);

        setState({
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setState({
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [datasetId, setPoints]);

  return state;
}
