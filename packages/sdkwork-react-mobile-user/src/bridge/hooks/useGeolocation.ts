import { useCallback, useEffect, useState } from 'react';
import { GeolocationBridge } from '../native/geolocation';
import type {
  GeolocationOptions,
  GeolocationPermissionResult,
  GeolocationResult,
  GeolocationWatcher,
} from '../types';

/**
 * Geolocation Hook
 * Provides location query and watcher capabilities.
 */
export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<GeolocationResult | null>(null);
  const [permissions, setPermissions] = useState<GeolocationPermissionResult>({
    location: false,
    coarseLocation: false,
  });

  const getCurrentPosition = useCallback(async (options?: GeolocationOptions): Promise<GeolocationResult> => {
    setIsLoading(true);
    try {
      const result = await GeolocationBridge.getCurrentPosition(options);
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const nextPermissions = await GeolocationBridge.requestPermissions();
    setPermissions(nextPermissions);
    return nextPermissions.location || nextPermissions.coarseLocation;
  }, []);

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    const nextPermissions = await GeolocationBridge.checkPermissions();
    setPermissions(nextPermissions);
    return nextPermissions.location || nextPermissions.coarseLocation;
  }, []);

  const stopWatching = useCallback(async (): Promise<void> => {
    if (!watchId) return;
    await GeolocationBridge.clearWatch(watchId);
    setWatchId(null);
    setIsWatching(false);
  }, [watchId]);

  const startWatching = useCallback(
    async (callback?: GeolocationWatcher, options?: GeolocationOptions): Promise<boolean> => {
      if (watchId) {
        await GeolocationBridge.clearWatch(watchId);
      }

      const nextWatchId = await GeolocationBridge.watchPosition((result) => {
        setLastResult(result);
        callback?.(result);
      }, options);

      if (!nextWatchId) {
        setWatchId(null);
        setIsWatching(false);
        return false;
      }

      setWatchId(nextWatchId);
      setIsWatching(true);
      return true;
    },
    [watchId],
  );

  useEffect(() => {
    return () => {
      if (!watchId) return;
      void GeolocationBridge.clearWatch(watchId);
    };
  }, [watchId]);

  return {
    isLoading,
    isWatching,
    lastResult,
    permissions,
    getCurrentPosition,
    requestPermissions,
    checkPermissions,
    startWatching,
    stopWatching,
  };
}
