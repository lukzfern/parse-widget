import { useCallback, useEffect, useRef, useState } from 'react';
import { config } from '@/config';
import {
  fetchCharacterZoneRankings,
  getLatestZone,
  getZoneName,
} from '@/api/warcraftlogs';
import type { CharacterData } from '@/types/warcraftlogs';

interface ParsesState {
  character: CharacterData | null;
  zoneName: string;
  zoneId: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseParsesResult extends ParsesState {
  refresh: () => void;
}

export function useParses(): UseParsesResult {
  const [state, setState] = useState<ParsesState>({
    character: null,
    zoneName: '',
    zoneId: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    // Cancel any in-flight request and create a new controller.
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    // Increment the load generation so stale responses can be ignored.
    loadIdRef.current += 1;
    const myLoadId = loadIdRef.current;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // If VITE_ZONE_ID is set, use it directly (zones fetch skipped).
      // Otherwise getLatestZone() detects the current raid tier (result cached).
      let zoneId: number;
      let zoneName: string;

      if (config.zone.id !== null) {
        zoneId   = config.zone.id;
        zoneName = await getZoneName(zoneId, signal);
      } else {
        ({ zoneId, zoneName } = await getLatestZone(signal));
      }

      const character = await fetchCharacterZoneRankings(
        {
          name:         config.character.name,
          serverSlug:   config.character.serverSlug,
          serverRegion: config.character.region,
          zoneID:       zoneId,
          difficulty:   config.zone.difficulty,
          metric:       config.zone.metric,
        },
        signal,
      );

      // Discard if a newer load started while this one was in-flight.
      if (myLoadId !== loadIdRef.current) return;

      setState({
        character,
        zoneName,
        zoneId,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      // Ignore intentional aborts and responses from superseded loads.
      if (signal.aborted || myLoadId !== loadIdRef.current) return;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  useEffect(() => {
    void load();
    timerRef.current = setInterval(() => void load(), config.ui.refreshInterval);
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, [load]);

  return { ...state, refresh: () => { void load(); } };
}

