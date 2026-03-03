import { create } from 'zustand';
import type { NotificationState, Notification } from '../types';
import { notificationService } from '../services/NotificationService';

interface NotificationStore extends NotificationState {
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  loadNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications();
      const unreadCount = await notificationService.getUnreadCount();
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      const notifications = await notificationService.getNotifications();
      const unreadCount = await notificationService.getUnreadCount();
      set({ notifications, unreadCount });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      const notifications = await notificationService.getNotifications();
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const notifications = await notificationService.getNotifications();
      const unreadCount = await notificationService.getUnreadCount();
      set({ notifications, unreadCount });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
