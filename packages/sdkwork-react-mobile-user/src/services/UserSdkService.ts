import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { UserProfile } from '../types';

const TAG = 'UserSdkService';

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

  private async fileToBase64DataUrl(file: File): Promise<string | null> {
    if (typeof FileReader === 'undefined') {
      return null;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = typeof reader.result === 'string' ? reader.result : '';
        resolve(value || null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async fetchProfile(options?: UserSdkFetchProfileOptions): Promise<UserProfile | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.user.getUserProfile() as SdkApiResult<SdkUserProfileVO>;
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
      const client = await this.getClient();
      const result = await client.user.updateUserProfile(updates) as SdkApiResult<SdkUserProfileVO>;
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

    try {
      const client = await this.getClient();
      const fileData = await this.fileToBase64DataUrl(file);
      if (!fileData) {
        this.deps.logger.warn(TAG, 'SDK uploadAvatar file conversion failed');
        return null;
      }

      const result = await client.user.uploadAvatar({ file: fileData }) as SdkApiResult<SdkAvatarUploadVO>;
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
