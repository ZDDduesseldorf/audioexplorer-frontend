import { useState, useEffect } from "react";
import { fetchAudioData } from "../services/audioDataService";
import { useAppStore } from "../store/useAppStore";

interface AudioDataState {
  loading: boolean;
  error: Error | null;
}

// Fetches the dataset and puts it into the global store (points +
// filteredPoints); loading/error stay local since only App shows them.
export function useAudioData(datasetId: string): AudioDataState {
  const setPoints = useAppStore((s) => s.setPoints);

  const [state, setState] = useState<AudioDataState>({
    loading: true,
    error: null,
  });

  useEffect(() => {
    setPoints([]);
    setState({ loading: true, error: null });
    fetchAudioData(datasetId)
      .then((data) => {
        setPoints(data);
        setState({ loading: false, error: null });
      })
      .catch((err) =>
        setState({
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }),
      );
  }, [datasetId, setPoints]);

  return state;
}
