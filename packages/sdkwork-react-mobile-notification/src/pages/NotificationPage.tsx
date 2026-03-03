import React from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import { useNotification } from '../hooks/useNotification';

interface NotificationPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onNotificationClick?: (notification: any) => void;
}

export const NotificationPage: React.FC<NotificationPageProps> = ({ t, onBack, onNotificationClick }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">🔔</div>;
      case 'chat':
        return <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">💬</div>;
      case 'social':
        return <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">👥</div>;
      case 'commerce':
        return <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">🛒</div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">📢</div>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Navbar
        title={`${tr('notification.title', '通知')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        onBack={onBack}
        rightElement={unreadCount > 0 ? (
          <button onClick={markAllAsRead} className="text-sm text-[var(--primary-color)]">
            {tr('notification.mark_all_read', '全部已读')}
          </button>
        ) : null}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Bell className="w-12 h-12 mb-2" />
            <p>{tr('notification.empty', '暂无通知')}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markAsRead(notif.id);
                  onNotificationClick?.(notif);
                }}
                className={`flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer ${
                  !notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{notif.title}</span>
                    <span className="text-xs text-gray-400">{new Date(notif.createTime).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
