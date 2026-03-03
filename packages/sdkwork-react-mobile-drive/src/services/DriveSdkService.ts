import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { DriveFile, DriveStats, FileType } from '../types';

const TAG = 'DriveSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkDriveItemVO {
  id?: string | number;
  itemId?: string | number;
  name?: string;
  filename?: string;
  type?: string;
  mimeType?: string;
  size?: number | string;
  url?: string;
  parentId?: string | number | null;
  parentItemId?: string | number | null;
  createTime?: number | string;
  updateTime?: number | string;
  createdAt?: number | string;
  updatedAt?: number | string;
}

interface SdkDriveStatsVO {
  total?: number | string;
  used?: number | string;
  usage?: number | string;
  usedSize?: number | string;
  image?: number | string;
  video?: number | string;
  document?: number | string;
  audio?: number | string;
  other?: number | string;
}

export interface IDriveSdkService {
  hasSdkBaseUrl(): boolean;
  listFiles(parentId: string | null): Promise<DriveFile[] | null>;
  uploadFile(file: File, parentId: string | null): Promise<DriveFile | null>;
  deleteFile(id: string): Promise<boolean | null>;
  getStats(): Promise<DriveStats | null>;
}

class DriveSdkServiceImpl implements IDriveSdkService {
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

  private toNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  }

  private normalizeFileType(type: string | undefined, mimeType: string | undefined): FileType {
    const rawType = (type || '').toLowerCase();
    const rawMime = (mimeType || '').toLowerCase();

    const typeMapping: Record<string, FileType> = {
      image: 'image',
      video: 'video',
      audio: 'audio',
      document: 'document',
      doc: 'document',
      folder: 'folder',
      directory: 'folder',
    };
    if (typeMapping[rawType]) return typeMapping[rawType];

    if (rawMime.startsWith('image/')) return 'image';
    if (rawMime.startsWith('video/')) return 'video';
    if (rawMime.startsWith('audio/')) return 'audio';
    return 'document';
  }

  private extractDriveItemList(data: unknown): SdkDriveItemVO[] {
    if (Array.isArray(data)) return data as SdkDriveItemVO[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['list', 'items', 'records', 'content'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as SdkDriveItemVO[];
      }
    }
    return [];
  }

  private mapRemoteDriveFile(remote: SdkDriveItemVO | null | undefined, fallback?: Partial<DriveFile>): DriveFile | null {
    if (!remote || typeof remote !== 'object') return null;

    const idRaw = remote.id ?? remote.itemId ?? fallback?.id;
    if (idRaw === undefined || idRaw === null) return null;

    const now = this.deps.clock.now();
    const name = (remote.name || remote.filename || fallback?.name || '').trim();
    if (!name) return null;

    const parentRaw = remote.parentId ?? remote.parentItemId ?? fallback?.parentId ?? null;
    const parentId = parentRaw === null || parentRaw === undefined ? null : String(parentRaw);
    const type = this.normalizeFileType(remote.type, remote.mimeType);

    return {
      id: String(idRaw),
      name,
      type,
      size: this.toNumber(remote.size, fallback?.size || 0),
      url: (remote.url || fallback?.url || '').trim() || undefined,
      parentId,
      createTime: this.toTimestamp(remote.createTime ?? remote.createdAt, fallback?.createTime || now),
      updateTime: this.toTimestamp(remote.updateTime ?? remote.updatedAt, now),
    };
  }

  async listFiles(parentId: string | null): Promise<DriveFile[] | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const params = new URLSearchParams();
    if (typeof parentId === 'string') {
      params.set('parentId', parentId);
    }
    params.set('page', '1');
    params.set('size', '200');
    const endpoint = `/drive/items?${params.toString()}`;

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK listFiles business failure', { code: result.code, message: result.msg });
        return null;
      }

      return this.extractDriveItemList(result.data)
        .map((item) => this.mapRemoteDriveFile(item))
        .filter((item): item is DriveFile => item !== null);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK listFiles request failed', error);
      return null;
    }
  }

  async uploadFile(file: File, parentId: string | null): Promise<DriveFile | null> {
    if (!this.hasSdkBaseUrl()) return null;
    if (typeof fetch !== 'function') return null;

    try {
      if (typeof FormData !== 'undefined') {
        const headers = await this.resolveAuthHeaders({ includeContentType: false });
        const formData = new FormData();
        formData.append('file', file);
        if (parentId) {
          formData.append('parentId', parentId);
        }

        const uploadResponse = await fetch(this.buildUrl('/drive/items/upload'), {
          method: 'POST',
          headers,
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = (await uploadResponse.json()) as SdkApiResult<SdkDriveItemVO>;
          if (this.isSuccessCode(uploadResult.code)) {
            const mapped = this.mapRemoteDriveFile(uploadResult.data, {
              name: file.name,
              parentId,
              size: file.size,
            });
            if (mapped) return mapped;
          }
        }
      }
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK multipart upload failed, fallback to filesystem/files', error);
    }

    try {
      const result = await this.requestJson<SdkApiResult<SdkDriveItemVO>>('/filesystem/files', {
        method: 'POST',
        body: JSON.stringify({
          name: file.name,
          parentId,
          mimeType: file.type,
          size: file.size,
        }),
      });

      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK uploadFile business failure', { code: result.code, message: result.msg });
        return null;
      }

      return this.mapRemoteDriveFile(result.data, {
        name: file.name,
        parentId,
        size: file.size,
      });
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK uploadFile request failed', error);
      return null;
    }
  }

  async deleteFile(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(`/drive/items/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK deleteFile business failure', { code: result.code, message: result.msg, id });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK deleteFile request failed', { id, error });
      return false;
    }
  }

  async getStats(): Promise<DriveStats | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const endpoints = ['/filesystem/disks/default', '/drive/stats'];
    for (const endpoint of endpoints) {
      try {
        const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, { method: 'GET' }, { includeContentType: false });
        if (!this.isSuccessCode(result.code)) {
          this.deps.logger.warn(TAG, 'SDK getStats business failure', { endpoint, code: result.code, message: result.msg });
          continue;
        }

        if (result.data && typeof result.data === 'object') {
          const source = result.data as SdkDriveStatsVO;
          const total = this.toNumber(source.total, 0);
          const used = this.toNumber(source.used ?? source.usage ?? source.usedSize, 0);
          return {
            total,
            used,
            image: this.toNumber(source.image, 0),
            video: this.toNumber(source.video, 0),
            document: this.toNumber(source.document, 0),
            audio: this.toNumber(source.audio, 0),
            other: this.toNumber(source.other, 0),
          };
        }
      } catch (error) {
        this.deps.logger.warn(TAG, 'SDK getStats request failed', { endpoint, error });
      }
    }

    return null;
  }
}

export function createDriveSdkService(_deps?: ServiceFactoryDeps): IDriveSdkService {
  return new DriveSdkServiceImpl(_deps);
}

export const driveSdkService: IDriveSdkService = createDriveSdkService();
