import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Notification, NotificationType, INotificationService } from '../types';
import { createNotificationSdkService } from './NotificationSdkService';
import type { INotificationSdkService } from './NotificationSdkService';

const TAG = 'NotificationService';

const createSeedNotifications = (now: number): Notification[] => [
  {
    id: 'notif_1',
    title: 'System Notification',
    message: 'Welcome to OpenChat',
    type: 'system',
    isRead: false,
    createTime: now,
    updateTime: now,
  },
  {
    id: 'notif_2',
    title: 'New Message',
    message: 'You have unread messages',
    type: 'chat',
    isRead: false,
    createTime: now,
    updateTime: now,
  },
];

class NotificationServiceImpl extends AbstractStorageService<Notification> implements INotificationService {
  protected STORAGE_KEY = 'sys_notifications_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: INotificationSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createNotificationSdkService(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0 && !this.sdkService.hasSdkBaseUrl()) {
      const now = this.deps.clock.now();
      this.cache = createSeedNotifications(now);
      await this.commit();
      this.deps.logger.info(TAG, 'Mock notifications initialized');
    }
  }

  async getNotifications(): Promise<Notification[]> {
    const remoteList = await this.sdkService.listNotifications();
    if (remoteList) {
      const sorted = [...remoteList].sort((a, b) => b.createTime - a.createTime);
      this.cache = sorted;
      await this.commit();
      return sorted;
    }

    const result = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });
    return result.content || [];
  }

  async markAsRead(id: string): Promise<void> {
    const remoteUpdated = await this.sdkService.markAsRead(id);
    if (remoteUpdated) {
      await this.save(remoteUpdated);
      this.deps.logger.info(TAG, 'Notification marked as read through SDK', { id });
      return;
    }

    const notif = await this.findById(id);
    if (notif && !notif.isRead) {
      notif.isRead = true;
      notif.updateTime = this.deps.clock.now();
      await this.save(notif);
      this.deps.logger.info(TAG, 'Notification marked as read', { id });
    }
  }

  async markAllAsRead(): Promise<void> {
    const remoteResult = await this.sdkService.markAllAsRead();
    if (remoteResult) {
      const remoteList = await this.sdkService.listNotifications();
      if (remoteList) {
        this.cache = remoteList.sort((a, b) => b.createTime - a.createTime);
        await this.commit();
      } else {
        const list = await this.findAll();
        for (const notif of list.content) {
          if (!notif.isRead) {
            notif.isRead = true;
            notif.updateTime = this.deps.clock.now();
            await this.save(notif);
          }
        }
      }

      this.deps.logger.info(TAG, 'All notifications marked as read through SDK');
      return;
    }

    const list = await this.findAll();
    for (const notif of list.content) {
      if (!notif.isRead) {
        notif.isRead = true;
        notif.updateTime = this.deps.clock.now();
        await this.save(notif);
      }
    }
    this.deps.logger.info(TAG, 'All notifications marked as read');
  }

  async deleteNotification(id: string): Promise<void> {
    const remoteResult = await this.sdkService.deleteNotification(id);
    if (remoteResult) {
      await this.deleteById(id);
      this.deps.logger.info(TAG, 'Notification deleted through SDK', { id });
      return;
    }

    await this.deleteById(id);
    this.deps.logger.info(TAG, 'Notification deleted', { id });
  }

  async getUnreadCount(): Promise<number> {
    const remoteCount = await this.sdkService.getUnreadCount();
    if (typeof remoteCount === 'number') {
      return remoteCount;
    }

    const list = await this.findAll();
    return list.content.filter((n) => !n.isRead).length;
  }

  async addNotification(
    title: string,
    message: string,
    type: NotificationType,
    data?: Record<string, unknown>,
  ): Promise<Notification> {
    const now = this.deps.clock.now();
    const notif: Notification = {
      id: this.deps.idGenerator.next('notif'),
      title,
      message,
      type,
      isRead: false,
      data,
      createTime: now,
      updateTime: now,
    };

    await this.save(notif);
    this.deps.logger.info(TAG, 'Notification added', { id: notif.id, type });
    return notif;
  }
}

export function createNotificationService(_deps?: ServiceFactoryDeps): INotificationService {
  return new NotificationServiceImpl(_deps);
}

export const notificationService: INotificationService = createNotificationService();
