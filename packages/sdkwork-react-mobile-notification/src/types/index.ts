import type { BaseEntity } from '@sdkwork/react-mobile-core';

export type NotificationType = 'system' | 'chat' | 'social' | 'commerce';

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface INotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getUnreadCount(): Promise<number>;
}
