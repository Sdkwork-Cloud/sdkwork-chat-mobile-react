import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { QueryParams, SdkworkAppClient } from '@sdkwork/app-sdk';
import type { FavoriteItem, FavoriteType } from '../types';

const TAG = 'FavoritesSdkService';

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

  private buildQuery(query: FavoritesSdkQuery): QueryParams {
    const page = query.page || 1;
    const size = query.size || 20;
    return {
      page,
      size,
      category: query.category && query.category !== 'all' ? query.category : undefined,
      keyword: query.keyword || undefined,
    };
  }

  async listFavorites(query: FavoritesSdkQuery): Promise<FavoriteItem[] | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.favorite.listFavorites(this.buildQuery(query)) as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK listFavorites business failure', { code: result.code, message: result.msg });
        return null;
      }

      return this.extractFavoriteList(result.data)
        .map((item) => this.mapRemoteFavorite(item))
        .filter((item): item is FavoriteItem => item !== null);
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
      tags: Array.isArray(item.tags) ? item.tags.join(',') : item.tags,
    };

    try {
      const client = await this.getClient();
      const result = await client.favorite.add(body) as SdkApiResult<SdkFavoriteVO>;
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
      const client = await this.getClient();
      const result = await client.favorite.remove(id) as SdkApiResult<unknown>;
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
