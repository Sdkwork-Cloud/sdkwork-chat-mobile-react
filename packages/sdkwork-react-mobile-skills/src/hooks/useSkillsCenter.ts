import React from 'react';
import type { SkillsCenterGroups } from '../types';
import { skillsSdkService } from '../services';

const EMPTY_GROUPS: SkillsCenterGroups = {
  packages: [],
  singles: [],
};

export interface UseSkillsCenterResult {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  groups: SkillsCenterGroups;
  isLoading: boolean;
  error: string | null;
  hasBackend: boolean;
  reload: () => Promise<void>;
}

export function useSkillsCenter(initialQuery = ''): UseSkillsCenterResult {
  const [query, setQuery] = React.useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);
  const [groups, setGroups] = React.useState<SkillsCenterGroups>(EMPTY_GROUPS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hasBackend = React.useMemo(() => skillsSdkService.hasSdkBaseUrl(), []);

  const loadData = React.useCallback(async (keyword: string) => {
    if (!hasBackend) {
      setGroups(EMPTY_GROUPS);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await skillsSdkService.listCenterData({
      keyword,
      page: 0,
      pageSize: 200,
    });

    if (!result) {
      setGroups(EMPTY_GROUPS);
      setError('request_failed');
      setIsLoading(false);
      return;
    }

    setGroups(result);
    setError(null);
    setIsLoading(false);
  }, [hasBackend]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 220);
    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      const result = await skillsSdkService.listCenterData({
        keyword: debouncedQuery,
        page: 0,
        pageSize: 200,
      });

      if (cancelled) return;
      if (!result) {
        setGroups(EMPTY_GROUPS);
        setError(hasBackend ? 'request_failed' : null);
        setIsLoading(false);
        return;
      }

      setGroups(result);
      setError(null);
      setIsLoading(false);
    };

    if (!hasBackend) {
      setGroups(EMPTY_GROUPS);
      setError(null);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, hasBackend]);

  const reload = React.useCallback(async () => {
    await loadData(debouncedQuery);
  }, [debouncedQuery, loadData]);

  return {
    query,
    setQuery,
    groups,
    isLoading,
    error,
    hasBackend,
    reload,
  };
}
