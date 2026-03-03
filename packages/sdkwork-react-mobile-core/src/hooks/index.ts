import { useState, useEffect, useCallback } from 'react';
import { getPlatform } from '../platform';

/**
 * Hook for platform storage operations
 */
export function useStorage<T>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const platform = getPlatform();
      const data = await platform.storage.get(key);
      if (data !== null && data !== undefined) {
        setValue(data as T);
      }
      setLoading(false);
    };
    load();
  }, [key]);

  const save = useCallback(async (newValue: T) => {
    const platform = getPlatform();
    await platform.storage.set(key, newValue);
    setValue(newValue);
  }, [key]);

  const remove = useCallback(async () => {
    const platform = getPlatform();
    await platform.storage.remove(key);
    setValue(undefined);
  }, [key]);

  return { value, loading, save, remove };
}

/**
 * Hook for platform information
 */
export function usePlatform() {
  const [platform, setPlatform] = useState(getPlatform());

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  return platform;
}

/**
 * Hook for online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for document visibility
 */
export function useVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
