import { create } from 'zustand';
import type { SearchState } from '../types';
import { searchService } from '../services/SearchService';

interface SearchStore extends SearchState {
  loadHistory: () => Promise<void>;
  addHistory: (keyword: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  search: (keyword: string, contextSessionId?: string) => Promise<void>;
}

const EMPTY_RESULTS: SearchState['results'] = { agents: [], chats: [], others: [] };
let activeSearchRequest = 0;
let lastSearchKey = '';

export const useSearchStore = create<SearchStore>((set) => ({
  history: [],
  results: { agents: [], chats: [], others: [] },
  isLoading: false,
  error: null,

  loadHistory: async () => {
    const history = await searchService.getHistory();
    set({ history });
  },

  addHistory: async (keyword: string) => {
    await searchService.addHistory(keyword);
    const history = await searchService.getHistory();
    set({ history });
  },

  clearHistory: async () => {
    await searchService.clearHistory();
    set({ history: [] });
  },

  search: async (keyword: string, contextSessionId?: string) => {
    const normalizedKeyword = keyword.trim();
    const contextKey = contextSessionId || '__all__';
    const searchKey = `${contextKey}::${normalizedKeyword}`;

    if (!normalizedKeyword) {
      lastSearchKey = '';
      set({ results: EMPTY_RESULTS, isLoading: false, error: null });
      return;
    }

    if (searchKey === lastSearchKey) {
      return;
    }

    lastSearchKey = searchKey;
    const requestId = ++activeSearchRequest;
    set((state) => (state.isLoading ? { error: null } : { isLoading: true, error: null }));

    try {
      const results = await searchService.search(normalizedKeyword, contextSessionId);
      if (requestId !== activeSearchRequest) return;
      set({ results, isLoading: false, error: null });
    } catch (error) {
      if (requestId !== activeSearchRequest) return;
      lastSearchKey = '';
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
