import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { Notification, NotificationType } from '../types';

const TAG = 'NotificationSdkService';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

interface SdkNotificationVO {
  id?: string | number;
  notificationId?: string | number;
  title?: string;
  message?: string;
  content?: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  data?: Record<string, unknown>;
  createTime?: number | string;
  updateTime?: number | string;
}

export interface INotificationSdkService {
  hasSdkBaseUrl(): boolean;
  listNotifications(): Promise<Notification[] | null>;
  markAsRead(id: string): Promise<Notification | null>;
  markAllAsRead(): Promise<boolean | null>;
  deleteNotification(id: string): Promise<boolean | null>;
  getUnreadCount(): Promise<number | null>;
}

class NotificationSdkServiceImpl implements INotificationSdkService {
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

  private normalizeType(value: unknown): NotificationType {
    const raw = typeof value === 'string' ? value.toLowerCase() : '';
    const candidate = raw as NotificationType;
    const supported: NotificationType[] = ['system', 'chat', 'social', 'commerce'];
    return supported.includes(candidate) ? candidate : 'system';
  }

  private extractNotificationList(data: unknown): SdkNotificationVO[] {
    if (Array.isArray(data)) return data as SdkNotificationVO[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['list', 'items', 'records', 'content'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as SdkNotificationVO[];
      }
    }
    return [];
  }

  private mapRemoteNotification(remote: SdkNotificationVO | null | undefined): Notification | null {
    if (!remote || typeof remote !== 'object') return null;

    const idRaw = remote.id ?? remote.notificationId;
    if (idRaw === undefined || idRaw === null) return null;

    const now = this.deps.clock.now();
    return {
      id: String(idRaw),
      title: (remote.title || '').trim() || 'Notification',
      message: (remote.message || remote.content || '').trim(),
      type: this.normalizeType(remote.type),
      isRead: typeof remote.isRead === 'boolean' ? remote.isRead : (remote.read ?? false),
      data: remote.data,
      createTime: this.toTimestamp(remote.createTime, now),
      updateTime: this.toTimestamp(remote.updateTime, now),
    };
  }

  async listNotifications(): Promise<Notification[] | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.notification.listNotifications({ page: 0, size: 100 }) as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK listNotifications business failure', { code: result.code, message: result.msg });
        return null;
      }

      return this.extractNotificationList(result.data)
        .map((item) => this.mapRemoteNotification(item))
        .filter((item): item is Notification => item !== null);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK listNotifications request failed', error);
      return null;
    }
  }

  async markAsRead(id: string): Promise<Notification | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.notification.markAsRead(id) as SdkApiResult<SdkNotificationVO>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK markAsRead business failure', { code: result.code, message: result.msg, id });
        return null;
      }
      return this.mapRemoteNotification(result.data);
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK markAsRead request failed', { id, error });
      return null;
    }
  }

  async markAllAsRead(): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.notification.markAllAsRead() as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK markAllAsRead business failure', { code: result.code, message: result.msg });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK markAllAsRead request failed', error);
      return false;
    }
  }

  async deleteNotification(id: string): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.notification.deleteNotification(id) as SdkApiResult<unknown>;
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK deleteNotification business failure', { code: result.code, message: result.msg, id });
        return false;
      }
      return true;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK deleteNotification request failed', { id, error });
      return false;
    }
  }

  async getUnreadCount(): Promise<number | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const result = await client.notification.getUnreadCount() as SdkApiResult<unknown>;

      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK getUnreadCount business failure', { code: result.code, message: result.msg });
        return null;
      }

      if (typeof result.data === 'number') return result.data;
      if (result.data && typeof result.data === 'object') {
        const source = result.data as Record<string, unknown>;
        const candidates = [source.unreadCount, source.count, source.total];
        for (const candidate of candidates) {
          if (typeof candidate === 'number') {
            return candidate;
          }
        }
      }
      return null;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK getUnreadCount request failed', error);
      return null;
    }
  }
}

export function createNotificationSdkService(_deps?: ServiceFactoryDeps): INotificationSdkService {
  return new NotificationSdkServiceImpl(_deps);
}

export const notificationSdkService: INotificationSdkService = createNotificationSdkService();
