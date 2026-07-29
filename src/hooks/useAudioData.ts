import { useState, useEffect } from "react";
import type { PointData } from "../domain/types";
import { fetchAudioData } from "../services/audioDataService";
import { useAppStore } from "../store/useAppStore";

interface AudioDataState {
  loading: boolean;
  error: Error | null;
}

/**
 * Possible anomaly field names returned by the backend.
 */
type ApiPointData = PointData & {
  anomaly_isolation_forest?: number | string | null;
  anomaly_lof?: number | string | null;
  anomalyIsolationForest?: number | string | null;
  anomalyLof?: number | string | null;
  isolationForest?: number | string | null;
  localOutlierFactor?: number | string | null;
};

/**
 * Keeps every existing property of the point and normalizes the anomaly
 * field names used by NodeDetails.
 */
function normalizePoint(point: ApiPointData): PointData {
  return {
    ...point,

    anomalie_isolation_forest:
      point.anomalie_isolation_forest ??
      point.anomaly_isolation_forest ??
      point.anomalyIsolationForest ??
      point.isolationForest ??
      null,

    anomalie_lof:
      point.anomalie_lof ??
      point.anomaly_lof ??
      point.anomalyLof ??
      point.localOutlierFactor ??
      null,
  };
}

// Fetches the dataset and puts it into the global store.
// loading/error stay local since only App shows them.
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
      .then((data) => {
        if (isCancelled) {
          return;
        }

        const normalizedPoints = data.map((point) =>
          normalizePoint(point as ApiPointData),
        );

        setPoints(normalizedPoints);

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
