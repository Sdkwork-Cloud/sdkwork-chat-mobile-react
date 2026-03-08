import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { SearchHistory } from '../types';

const TAG = 'SearchSdkService';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkSearchHistoryVO {
  id?: string | number;
  historyId?: string | number;
  keyword?: string;
  count?: number;
  searchCount?: number;
  createTime?: number | string;
  updateTime?: number | string;
  searchTime?: number | string;
}

export interface ISearchSdkService {
  hasSdkBaseUrl(): boolean;
  getHistory(): Promise<SearchHistory[] | null>;
  addHistory(keyword: string): Promise<boolean | null>;
  clearHistory(): Promise<boolean | null>;
}

class SearchSdkServiceImpl implements ISearchSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    return (createAppSdkCoreConfig().baseUrl || '').trim().length > 0;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private toTimestamp(value: unknown, fallback: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  private extractHistoryList(data: unknown): SdkSearchHistoryVO[] {
    if (Array.isArray(data)) return data as SdkSearchHistoryVO[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['list', 'items', 'records', 'content'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as SdkSearchHistoryVO[];
      }
    }
    return [];
  }

  private mapRemoteHistory(remote: SdkSearchHistoryVO | null | undefined): SearchHistory | null {
    if (!remote || typeof remote !== 'object') return null;

    const keyword = (remote.keyword || '').trim();
    if (!keyword) return null;

    const now = this.deps.clock.now();
    const idRaw = remote.id ?? remote.historyId ?? keyword;
    const count = typeof remote.count === 'number'
      ? remote.count
      : (typeof remote.searchCount === 'number' ? remote.searchCount : 1);

    return {
      id: String(idRaw),
      keyword,
      count,
      createTime: this.toTimestamp(remote.createTime, now),
      updateTime: this.toTimestamp(remote.updateTime ?? remote.searchTime, now),
    };
  }

  async getHistory(): Promise<SearchHistory[] | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.search.getSearchHistory() as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK getHistory business failure', { code: result.code, message: result.msg });
        return null;
      }

      return this.extractHistoryList(result.data)
        .map((item) => this.mapRemoteHistory(item))
        .filter((item): item is SearchHistory => item !== null);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK getHistory request failed', error);
      return null;
    }
  }

  async addHistory(keyword: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) return false;

    try {
      const client = await this.getClient();
      const result = await client.search.addSearchHistory({ keyword: normalizedKeyword }) as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK addHistory business failure', { code: result.code, message: result.msg });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK addHistory request failed', error);
      return false;
    }
  }

  async clearHistory(): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.search.clearSearchHistory() as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK clearHistory business failure', { code: result.code, message: result.msg });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK clearHistory request failed', error);
      return false;
    }
  }
}

export function createSearchSdkService(_deps?: ServiceFactoryDeps): ISearchSdkService {
  return new SearchSdkServiceImpl(_deps);
}

export const searchSdkService: ISearchSdkService = createSearchSdkService();
