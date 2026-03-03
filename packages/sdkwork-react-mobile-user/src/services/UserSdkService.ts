import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { UserProfile } from '../types';

const TAG = 'UserSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkUserStatusVO {
  icon?: string;
  text?: string;
  isActive?: boolean;
}

interface SdkUserProfileVO {
  id?: string | number;
  userId?: string | number;
  username?: string;
  nickname?: string;
  name?: string;
  wxid?: string;
  avatar?: string;
  region?: string;
  gender?: 'male' | 'female' | string;
  signature?: string;
  status?: SdkUserStatusVO;
  createTime?: number | string;
  updateTime?: number | string;
}

interface SdkAvatarUploadVO {
  avatarUrl?: string;
  avatar?: string;
  url?: string;
}

export interface UserSdkFetchProfileOptions {
  currentUserId?: string | null;
  fallbackProfile?: UserProfile | null;
}

export interface UserSdkUpdateProfileOptions {
  currentUserId?: string | null;
  fallbackProfile?: UserProfile | null;
}

export interface IUserSdkService {
  hasSdkBaseUrl(): boolean;
  fetchProfile(options?: UserSdkFetchProfileOptions): Promise<UserProfile | null>;
  updateProfile(updates: Partial<UserProfile>, options?: UserSdkUpdateProfileOptions): Promise<UserProfile | null>;
  uploadAvatar(file: File): Promise<string | null>;
}

class UserSdkServiceImpl implements IUserSdkService {
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

  private mapRemoteProfile(
    remote: SdkUserProfileVO | null | undefined,
    options?: UserSdkFetchProfileOptions | UserSdkUpdateProfileOptions,
  ): UserProfile | null {
    if (!remote || typeof remote !== 'object') return null;

    const fallback = options?.fallbackProfile || null;
    const fallbackId = fallback?.id || options?.currentUserId || '';
    const idRaw = remote.userId ?? remote.id ?? fallbackId;
    if (!idRaw) return null;

    const now = this.deps.clock.now();
    const id = String(idRaw);
    const username = (remote.username || fallback?.name || '').trim();
    const derivedName = username ? `User_${username.slice(-4)}` : `User_${id.slice(-4)}`;
    const statusSource = remote.status;

    return {
      id,
      createTime: this.toTimestamp(remote.createTime, fallback?.createTime || now),
      updateTime: this.toTimestamp(remote.updateTime, now),
      name: (remote.nickname || remote.name || fallback?.name || derivedName).trim() || derivedName,
      wxid: (remote.wxid || fallback?.wxid || `wx_${username || id}`).trim(),
      avatar: (remote.avatar || fallback?.avatar || '').trim(),
      region: (remote.region || fallback?.region || 'Unknown').trim(),
      gender: remote.gender === 'female' ? 'female' : (fallback?.gender || 'male'),
      signature: (remote.signature || fallback?.signature || '').trim(),
      status: {
        icon: (statusSource?.icon || fallback?.status?.icon || 'online').trim(),
        text: (statusSource?.text || fallback?.status?.text || 'Active').trim(),
        isActive:
          typeof statusSource?.isActive === 'boolean'
            ? statusSource.isActive
            : (fallback?.status?.isActive ?? true),
      },
    };
  }

  async fetchProfile(options?: UserSdkFetchProfileOptions): Promise<UserProfile | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const result = await this.requestJson<SdkApiResult<SdkUserProfileVO>>('/user/profile', { method: 'GET' }, {
        includeContentType: false,
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK fetchProfile business failure', { code: result.code, message: result.msg });
        return null;
      }
      return this.mapRemoteProfile(result.data, options);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK fetchProfile request failed', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<UserProfile>, options?: UserSdkUpdateProfileOptions): Promise<UserProfile | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const result = await this.requestJson<SdkApiResult<SdkUserProfileVO>>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK updateProfile business failure', { code: result.code, message: result.msg });
        return null;
      }

      const mapped = this.mapRemoteProfile(result.data, options);
      if (mapped) return mapped;

      const mergedFallback: UserProfile | null = options?.fallbackProfile
        ? {
            ...options.fallbackProfile,
            ...updates,
            updateTime: this.deps.clock.now(),
          }
        : null;

      return mergedFallback;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK updateProfile request failed', error);
      return null;
    }
  }

  async uploadAvatar(file: File): Promise<string | null> {
    if (!this.hasSdkBaseUrl()) return null;
    if (typeof fetch !== 'function' || typeof FormData === 'undefined') return null;

    try {
      const headers = await this.resolveAuthHeaders({ includeContentType: false });
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(this.buildUrl('/user/avatar'), {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as SdkApiResult<SdkAvatarUploadVO>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK uploadAvatar business failure', { code: result.code, message: result.msg });
        return null;
      }

      const url = (result.data?.avatarUrl || result.data?.avatar || result.data?.url || '').trim();
      return url || null;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK uploadAvatar request failed', error);
      return null;
    }
  }
}

export function createUserSdkService(_deps?: ServiceFactoryDeps): IUserSdkService {
  return new UserSdkServiceImpl(_deps);
}

export const userSdkService: IUserSdkService = createUserSdkService();
