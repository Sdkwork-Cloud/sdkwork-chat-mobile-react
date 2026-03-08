import React from 'react';
import { navigate } from '../../router';
import { useChatStoreState } from '../../stores/chatStore';
import { Badge } from '../Badge/Badge';
import { useTranslation } from '../../core/i18n/I18nContext';
import { Platform } from '../../platform';
import { APP_TABS, TabId, resolveTabByPath } from '../../app/shell/navigation';
import type { RoutePath } from '../../router/paths';
import { resolveTabClickAction } from './tabClickPolicy';
import './Tabbar.mobile.css';

const TabIcon: React.FC<{ id: TabId; active: boolean }> = ({ id, active }) => {
  const color = 'currentColor';
  const stroke = active ? 2.2 : 1.9;

  if (id === 'chat') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <path d="M6 7.2h12a2.2 2.2 0 0 1 2.2 2.2v6a2.2 2.2 0 0 1-2.2 2.2H12.4l-3.7 2.5v-2.5H6a2.2 2.2 0 0 1-2.2-2.2v-6A2.2 2.2 0 0 1 6 7.2Z" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.1 11.4h7.8M8.1 14h5.1" stroke={color} strokeWidth={stroke - 0.3} strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'agents') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <rect x="5.3" y="7" width="13.4" height="10.5" rx="3.2" stroke={color} strokeWidth={stroke} />
        <path d="M9.1 11.6h0M14.9 11.6h0" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <path d="M12 4.2v2.4M8.5 17.5v2.2M15.5 17.5v2.2" stroke={color} strokeWidth={stroke - 0.3} strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'creation') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <path d="M7.2 16.8 6 20l3.2-1.2L18.4 9.6a1.8 1.8 0 0 0 0-2.6l-1.4-1.4a1.8 1.8 0 0 0-2.6 0L7.2 16.8Z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
        <path d="m13.6 6.4 4 4M5.8 20h12.7" stroke={color} strokeWidth={stroke - 0.3} strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'discover') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.2" stroke={color} strokeWidth={stroke} />
        <path d="m14.8 9.2-1.7 4.2-4.2 1.7 1.7-4.2 4.2-1.7Z" stroke={color} strokeWidth={stroke - 0.3} strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.2" stroke={color} strokeWidth={stroke} />
      <path d="M5.8 19.3c.8-3 3.3-4.8 6.2-4.8s5.4 1.8 6.2 4.8" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
};

export const Tabbar: React.FC = () => {
  const { totalUnreadCount } = useChatStoreState();
  const { t } = useTranslation();
  const clickGuardRef = React.useRef<{ ts: number; tabId: TabId | null }>({ ts: 0, tabId: null });

  const tabs = React.useMemo(
    () =>
      APP_TABS.map((tab) => ({
        ...tab,
        label: t(tab.labelKey),
        badge: tab.id === 'chat' ? totalUnreadCount : undefined,
      })),
    [t, totalUnreadCount]
  );

  const [activeTab, setActiveTab] = React.useState<TabId>(resolveTabByPath(window.location.pathname));

  React.useEffect(() => {
    const handleRouteChange = () => {
      const currentTab = resolveTabByPath(window.location.pathname);
      setActiveTab(currentTab);
    };

    window.addEventListener('routechange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => {
      window.removeEventListener('routechange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleTabClick = (tab: { id: TabId; path: RoutePath }) => {
    if (!tab?.path) {
      return;
    }

    const currentPath = window.location.pathname;
    const action = resolveTabClickAction({
      activeTab,
      targetTab: tab.id,
      targetPath: tab.path,
      currentPath,
    });

    if (action.type === 'reselect') {
      window.dispatchEvent(
        new CustomEvent('tabreselect', {
          detail: { tabId: tab.id, path: currentPath },
        })
      );
      return;
    }

    if (activeTab !== tab.id) {
      try {
        Platform.device.vibrate(8);
      } catch (_error) {
        // Ignore haptics errors to keep tab navigation responsive.
      }
      setActiveTab(tab.id);
    }

    navigate(action.targetPath);
  };

  const handleTabActivate = (tab: { id: TabId; path: RoutePath }) => {
    const now = Date.now();
    if (now - clickGuardRef.current.ts < 450 && clickGuardRef.current.tabId === tab.id) return;
    clickGuardRef.current = { ts: now, tabId: tab.id };
    handleTabClick(tab);
  };

  return (
    <nav className="tabbar" role="tablist" aria-label="Bottom navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`tabbar__item ${isActive ? 'tabbar__item--active' : ''}`}
            onClick={() => handleTabActivate(tab)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            role="tab"
            aria-selected={isActive}
          >
            <Badge content={tab.badge} offset={[-5, 7]}>
              <div className="tabbar__icon">
                <TabIcon id={tab.id} active={isActive} />
              </div>
            </Badge>
            <div className="tabbar__label">{tab.label}</div>
          </button>
        );
      })}
    </nav>
  );
};

