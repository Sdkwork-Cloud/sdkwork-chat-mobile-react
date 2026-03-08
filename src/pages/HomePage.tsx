import React, { useEffect, useMemo, useState } from 'react';
import { notificationService } from '@sdkwork/react-mobile-notification';
import { Badge } from '../components/Badge/Badge';
import { ChatListItem } from '../components/ChatListItem/ChatListItem';
import { Navbar } from '../components/Navbar/Navbar';
import { PullToRefresh } from '../components/PullToRefresh/PullToRefresh';
import { AppEvents, EVENTS } from '../core/events';
import { useTranslation } from '../core/i18n/I18nContext';
import { navigate } from '../router';
import { ROUTE_PATHS } from '../router/paths';
import { openOmniChat } from '../navigation/openChatNavigation';
import { useChatStoreState } from '../stores/chatStore';
import './HomePage.css';

type HomeIconName = 'bell' | 'search' | 'plus' | 'spark' | 'group' | 'addUser' | 'scan';

const HomeIcon: React.FC<{ name: HomeIconName; size?: number }> = ({ name, size = 18 }) => {
  if (name === 'bell') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
        <path d="M6.2 9.7a5.8 5.8 0 1 1 11.6 0v4.1l1.2 2h-14l1.2-2V9.7Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 18.5a2.3 2.3 0 0 0 4 0" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'search') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="2" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'plus') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'spark') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
        <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'group') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="15.6" cy="9.8" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.8 17.5c.7-2.5 2.7-4 5-4 2.2 0 4.2 1.5 4.9 4M13.6 17.5c.4-1.6 1.7-2.7 3.2-2.7 1.4 0 2.7 1.1 3.2 2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'addUser') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="2.9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.8 17.3c.8-2.4 2.7-3.8 5-3.8s4.2 1.4 5 3.8M18 7.6v5.2M15.4 10.2h5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="m5.2 7.4 4.5-1.2 1.2 4.4-4.5 1.2-1.2-4.4ZM13.4 9.6l5.4-1.5-1.5 5.4-5.4 1.5 1.5-5.4ZM6 16.7l4.2 1.1 1.1 4.2-4.2-1.1L6 16.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
};

const PlusMenu: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  const menuItems = [
    { icon: 'spark' as HomeIconName, label: '\u5feb\u901f AI \u5bf9\u8bdd', action: () => openOmniChat() },
    { icon: 'group' as HomeIconName, label: t('menu_group_chat'), action: () => navigate(ROUTE_PATHS.contacts, { mode: 'select', action: 'create_group' }) },
    { icon: 'addUser' as HomeIconName, label: t('menu_add_friend'), action: () => navigate(ROUTE_PATHS.contacts) },
    { icon: 'scan' as HomeIconName, label: t('menu_scan'), action: () => navigate(ROUTE_PATHS.scan) },
  ];

  return (
    <>
      <div className="home-plus-mask" onClick={onClose} />
      <div className="home-plus-menu">
        <div className="home-plus-menu-arrow" />
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className="home-plus-menu-item"
            style={{ borderBottom: index === menuItems.length - 1 ? 'none' : undefined }}
            onClick={() => {
              onClose();
              item.action();
            }}
          >
            <span className="home-plus-menu-icon">
              <HomeIcon name={item.icon} size={17} />
            </span>
            <span className="home-plus-menu-label">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

const HomePage: React.FC = () => {
  const { sessions } = useChatStoreState();
  const [showMenu, setShowMenu] = useState(false);
  const [notifyCount, setNotifyCount] = useState(0);
  const { t } = useTranslation();

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const timeA = typeof a.lastMessageTime === 'number' ? a.lastMessageTime : 0;
      const timeB = typeof b.lastMessageTime === 'number' ? b.lastMessageTime : 0;
      return timeB - timeA;
    });
  }, [sessions]);

  useEffect(() => {
    const updateCount = async () => {
      const count = await notificationService.getUnreadCount();
      setNotifyCount(count);
    };
    updateCount();

    const unsub = AppEvents.on(EVENTS.DATA_CHANGE, (payload) => {
      if (payload.key === 'sys_notifications_v1') {
        updateCount();
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    const onTabReselect = (event: Event) => {
      const customEvent = event as CustomEvent<{ tabId?: string }>;
      if (customEvent.detail?.tabId !== 'chat') {
        return;
      }

      setShowMenu(false);
      const scroller = document.querySelector('.mobile-layout__content') as HTMLElement | null;
      scroller?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('tabreselect', onTabReselect as EventListener);
    return () => window.removeEventListener('tabreselect', onTabReselect as EventListener);
  }, []);

  useEffect(() => {
    const closeMenu = () => setShowMenu(false);
    window.addEventListener('routechange', closeMenu);
    window.addEventListener('popstate', closeMenu);
    return () => {
      window.removeEventListener('routechange', closeMenu);
      window.removeEventListener('popstate', closeMenu);
    };
  }, []);

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="home-page">
        <Navbar
          className="home-navbar"
          title={t('tab_chat')}
          subtitle="\u5373\u65f6\u6d88\u606f\u4e0e\u667a\u80fd\u534f\u4f5c"
          showBack={false}
          leftElement={(
            <div className="home-navbar-left">
              <Badge content={notifyCount} offset={[0, 4]}>
                <button type="button" className="home-icon-btn" onClick={() => navigate(ROUTE_PATHS.notifications)} aria-label="notifications">
                  <HomeIcon name="bell" />
                </button>
              </Badge>
            </div>
          )}
          rightElement={(
            <div className="home-navbar-actions">
              <button type="button" className="home-icon-btn" onClick={() => navigate(ROUTE_PATHS.search)} aria-label="search">
                <HomeIcon name="search" />
              </button>
              <button type="button" className="home-icon-btn" onClick={() => setShowMenu((prev) => !prev)} aria-label="more">
                <HomeIcon name="plus" />
              </button>
              <PlusMenu visible={showMenu} onClose={() => setShowMenu(false)} />
            </div>
          )}
        />

        <button type="button" className="home-search-row" onClick={() => navigate(ROUTE_PATHS.search)}>
          <HomeIcon name="search" size={15} />
          <span>{'\u641c\u7d22'}</span>
        </button>

        <button type="button" className="home-ai-entry" onClick={() => openOmniChat()}>
          <div className="home-ai-avatar">
            <HomeIcon name="spark" size={17} />
          </div>
          <div className="home-ai-content">
            <div className="home-ai-title">OpenChat AI {'\u52a9\u624b'}</div>
            <div className="home-ai-subtitle">
              {'\u63d0\u95ee\u3001\u603b\u7ed3\u3001\u521b\u4f5c\u4e0e\u4e0a\u4e0b\u6587\u7eed\u5199\uff0c\u90fd\u5728\u540c\u4e00\u4e2a\u5bf9\u8bdd\u7ebf\u7a0b\u91cc\u5b8c\u6210\u3002'}
            </div>
          </div>
          <div className="home-ai-action">{'\u5f00\u59cb'}</div>
        </button>

        <div className="home-list-container">
          <div className="home-session-panel">
            {sortedSessions.map((session, index) => (
              <div key={session.id}>
                <ChatListItem session={session} onClick={() => navigate(ROUTE_PATHS.chat, { id: session.id })} />
                {index !== sortedSessions.length - 1 && <div className="home-list-divider" />}
              </div>
            ))}

            {sortedSessions.length === 0 && (
              <div className="home-empty-state">
                <div className="home-empty-icon">
                  <HomeIcon name="spark" size={22} />
                </div>
                <div className="home-empty-title">{t('home_no_messages')}</div>
                <div className="home-empty-subtitle">
                  {'\u53d1\u8d77\u4f60\u7684\u7b2c\u4e00\u6761\u6d88\u606f\uff0c\u6216\u76f4\u63a5\u8fdb\u5165 AI \u52a9\u624b\u3002'}
                </div>
                <div className="home-empty-actions">
                  <button type="button" className="home-empty-primary" onClick={() => openOmniChat()}>
                    {'\u5f00\u59cb AI \u5bf9\u8bdd'}
                  </button>
                  <button type="button" className="home-empty-secondary" onClick={() => navigate(ROUTE_PATHS.agents)}>
                    {'\u6d4f\u89c8\u667a\u80fd\u4f53'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default HomePage;
