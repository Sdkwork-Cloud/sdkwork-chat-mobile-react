import type { BaseEntity } from '@sdkwork/react-mobile-core';

export interface SearchHistory extends BaseEntity {
  keyword: string;
  count: number;
}

export type SearchResultType = 'agent' | 'chat' | 'file' | 'article' | 'creation';

export interface SearchResultItem {
  id: string;
  title: string;
  subTitle: string;
  avatar?: string;
  type: SearchResultType;
  sessionId?: string;
  messageId?: string;
  score: number;
  timestamp: number;
}

export interface SearchResults {
  agents: SearchResultItem[];
  chats: SearchResultItem[];
  others: SearchResultItem[];
}

export interface SearchState {
  history: SearchHistory[];
  results: SearchResults;
  isLoading: boolean;
  error: string | null;
}

export interface ISearchService {
  getHistory(): Promise<SearchHistory[]>;
  addHistory(keyword: string): Promise<void>;
  clearHistory(): Promise<void>;
  search(keyword: string, contextSessionId?: string): Promise<SearchResults>;
}
