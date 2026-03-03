import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SearchHistory } from '../types';

const TAG = 'SearchSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

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

  private resolveEnv(name: string): string | undefined {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name];
  }

  private resolveBaseUrl(): string {
    return (this.resolveEnv('VITE_API_BASE_URL') || '').trim().replace(/\/+$/g, '');
  }

  hasSdkBaseUrl(): boolean {
    return this.resolveBaseUrl().length > 0;
  }

  private buildAppApiPath(path: string): string {
    const normalizedPrefixRaw = APP_API_PREFIX.trim();
    const normalizedPrefix = normalizedPrefixRaw ? `/${normalizedPrefixRaw.replace(/^\/+|\/+$/g, '')}` : '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (!normalizedPrefix || normalizedPrefix === '/') return normalizedPath;
    if (normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`)) return normalizedPath;
    return `${normalizedPrefix}${normalizedPath}`;
  }

  private buildUrl(path: string): string {
    return `${this.resolveBaseUrl()}${this.buildAppApiPath(path)}`;
  }

  private async resolveAuthHeaders(options?: { includeContentType?: boolean }): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (options?.includeContentType !== false) {
      headers['Content-Type'] = 'application/json';
    }

    const envToken = this.resolveEnv('VITE_ACCESS_TOKEN');
    const storageToken = await Promise.resolve(this.deps.storage.get<string>(AUTH_TOKEN_STORAGE_KEY));
    const accessToken = (envToken || storageToken || '').trim();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private async requestJson<T>(path: string, init: RequestInit, options?: { includeContentType?: boolean }): Promise<T> {
    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is not available');
    }

    const headers = await this.resolveAuthHeaders(options);
    const response = await fetch(this.buildUrl(path), {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
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
      const result = await this.requestJson<SdkApiResult<unknown>>('/search/history', { method: 'GET' }, { includeContentType: false });
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
      const result = await this.requestJson<SdkApiResult<unknown>>('/search/history', {
        method: 'POST',
        body: JSON.stringify({ keyword: normalizedKeyword }),
      });
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
      const result = await this.requestJson<SdkApiResult<unknown>>('/search/history', {
        method: 'DELETE',
      });
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
