import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { FavoriteItem, FavoriteType } from '../types';

const TAG = 'FavoritesSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkFavoriteVO {
  id?: string | number;
  favoriteId?: string | number;
  title?: string;
  type?: string;
  content?: string;
  url?: string;
  source?: string;
  size?: string;
  tags?: string[];
  createTime?: number | string;
  updateTime?: number | string;
}

export interface FavoritesSdkQuery {
  category: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface IFavoritesSdkService {
  hasSdkBaseUrl(): boolean;
  listFavorites(query: FavoritesSdkQuery): Promise<FavoriteItem[] | null>;
  addFavorite(item: Partial<FavoriteItem>): Promise<FavoriteItem | null>;
  removeFavorite(id: string): Promise<boolean | null>;
}

class FavoritesSdkServiceImpl implements IFavoritesSdkService {
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

  private normalizeType(value: unknown): FavoriteType {
    const raw = typeof value === 'string' ? value.toLowerCase() : '';
    const candidate = raw as FavoriteType;
    const supported: FavoriteType[] = ['link', 'file', 'doc', 'chat', 'text', 'image', 'video'];
    return supported.includes(candidate) ? candidate : 'text';
  }

  private extractFavoriteList(data: unknown): SdkFavoriteVO[] {
    if (Array.isArray(data)) return data as SdkFavoriteVO[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['list', 'items', 'records', 'content'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as SdkFavoriteVO[];
      }
    }
    return [];
  }

  private mapRemoteFavorite(remote: SdkFavoriteVO | null | undefined, fallback?: Partial<FavoriteItem>): FavoriteItem | null {
    if (!remote || typeof remote !== 'object') return null;

    const idRaw = remote.id ?? remote.favoriteId ?? fallback?.id;
    if (idRaw === undefined || idRaw === null) return null;

    const now = this.deps.clock.now();
    return {
      id: String(idRaw),
      title: (remote.title || fallback?.title || '').trim() || undefined,
      type: this.normalizeType(remote.type || fallback?.type),
      content: (remote.content || fallback?.content || '').trim() || undefined,
      url: (remote.url || fallback?.url || '').trim() || undefined,
      source: (remote.source || fallback?.source || '').trim() || undefined,
      size: (remote.size || fallback?.size || '').trim() || undefined,
      tags: Array.isArray(remote.tags) ? remote.tags : (fallback?.tags || undefined),
      createTime: this.toTimestamp(remote.createTime, fallback?.createTime || now),
      updateTime: this.toTimestamp(remote.updateTime, now),
    };
  }

  private buildQueryString(query: FavoritesSdkQuery): string {
    const params = new URLSearchParams();
    const page = query.page || 1;
    const size = query.size || 20;
    params.set('page', String(page));
    params.set('size', String(size));
    if (query.category && query.category !== 'all') {
      params.set('category', query.category);
    }
    if (query.keyword) {
      params.set('keyword', query.keyword);
    }
    return params.toString();
  }

  async listFavorites(query: FavoritesSdkQuery): Promise<FavoriteItem[] | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const qs = this.buildQueryString(query);
    const endpoint = qs ? `/favorite?${qs}` : '/favorite';

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK listFavorites business failure', { code: result.code, message: result.msg });
        return null;
      }

      const mapped = this.extractFavoriteList(result.data)
        .map((item) => this.mapRemoteFavorite(item))
        .filter((item): item is FavoriteItem => item !== null);

      return mapped;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK listFavorites request failed', error);
      return null;
    }
  }

  async addFavorite(item: Partial<FavoriteItem>): Promise<FavoriteItem | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const body = {
      title: item.title,
      type: item.type || 'text',
      content: item.content,
      url: item.url,
      source: item.source,
      size: item.size,
      tags: item.tags,
    };

    try {
      const result = await this.requestJson<SdkApiResult<SdkFavoriteVO>>('/favorite', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK addFavorite business failure', { code: result.code, message: result.msg });
        return null;
      }
      return this.mapRemoteFavorite(result.data, item);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK addFavorite request failed', error);
      return null;
    }
  }

  async removeFavorite(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(`/favorite/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK removeFavorite business failure', { code: result.code, message: result.msg, id });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK removeFavorite request failed', { id, error });
      return false;
    }
  }
}

export function createFavoritesSdkService(_deps?: ServiceFactoryDeps): IFavoritesSdkService {
  return new FavoritesSdkServiceImpl(_deps);
}

export const favoritesSdkService: IFavoritesSdkService = createFavoritesSdkService();
