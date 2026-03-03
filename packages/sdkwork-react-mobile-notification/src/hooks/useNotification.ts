import { useCallback, useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';

export function useNotification() {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const error = useNotificationStore((state) => state.error);
  const loadNotifications = useNotificationStore((state) => state.loadNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      await markAsRead(id);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteNotification(id);
    },
    [deleteNotification]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
  };
}

export function useUnreadCount() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const loadNotifications = useNotificationStore((state) => state.loadNotifications);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  return unreadCount;
}
