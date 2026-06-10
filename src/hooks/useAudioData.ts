import { useState, useEffect } from 'react';
import type { PointData } from '../domain/types';
import { fetchAudioData } from '../services/audioDataService';

interface AudioDataState {
  data: PointData[];
  loading: boolean;
  error: Error | null;
}

export function useAudioData(datasetId: string): AudioDataState {
  const [state, setState] = useState<AudioDataState>({ data: [], loading: true, error: null });

  useEffect(() => {
    setState({ data: [], loading: true, error: null });
    fetchAudioData(datasetId)
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => setState({ data: [], loading: false, error: err instanceof Error ? err : new Error(String(err)) }));
  }, [datasetId]);

  return state;
}
