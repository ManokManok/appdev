import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const DEFAULT_STALE_MS = 30_000;

/**
 * Loads list data on focus without flashing the pull-to-refresh spinner on every tab switch.
 */
export const useRefreshableData = (loader, { enabled = true, staleMs = DEFAULT_STALE_MS } = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasDataRef = useRef(false);
  const lastFetchedAtRef = useRef(0);

  const load = useCallback(
    async ({ pull = false, force = false } = {}) => {
      if (!enabled) {
        return;
      }

      const now = Date.now();
      if (!force && !pull && hasDataRef.current && now - lastFetchedAtRef.current < staleMs) {
        return;
      }

      if (pull) {
        setRefreshing(true);
      } else if (!hasDataRef.current) {
        setIsLoading(true);
      }

      try {
        const result = await loader();
        setData(result);
        hasDataRef.current = true;
        lastFetchedAtRef.current = Date.now();
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [enabled, loader, staleMs]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = useCallback(() => load({ pull: true, force: true }), [load]);
  const reload = useCallback(() => load({ force: true }), [load]);

  return {
    data,
    setData,
    isLoading,
    refreshing,
    refresh,
    reload,
    hasData: hasDataRef.current,
  };
};
