import { useCallback, useEffect } from 'react';
import { useSearchStore } from '../stores/searchStore';

export function useSearch() {
  const history = useSearchStore((state) => state.history);
  const results = useSearchStore((state) => state.results);
  const isLoading = useSearchStore((state) => state.isLoading);
  const error = useSearchStore((state) => state.error);
  const search = useSearchStore((state) => state.search);
  const addHistory = useSearchStore((state) => state.addHistory);
  const clearHistory = useSearchStore((state) => state.clearHistory);
  const loadHistory = useSearchStore((state) => state.loadHistory);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleSearch = useCallback(
    async (keyword: string, contextSessionId?: string) => {
      await search(keyword, contextSessionId);
    },
    [search]
  );

  return {
    history,
    results,
    isLoading,
    error,
    search: handleSearch,
    addHistory,
    clearHistory,
    loadHistory,
  };
}
