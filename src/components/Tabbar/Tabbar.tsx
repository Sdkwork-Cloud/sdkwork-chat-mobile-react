import React from 'react';
import { navigate } from '../../router';
import { useChatStoreState } from '../../stores/chatStore';
import { Badge } from '../Badge/Badge';
import { useTranslation } from '../../core/i18n/I18nContext';
import { Platform } from '../../platform';
import { APP_TABS, TabId, resolveTabByPath } from '../../app/shell/navigation';
import type { RoutePath } from '../../router/paths';
import { resolveTabClickAction } from './tabClickPolicy';
import { TabbarIcon } from './tabbarIcons';
import './Tabbar.mobile.css';

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
        const iconVariant = isActive ? 'filled' : 'outline';

        return (
          <button
            key={tab.id}
            type="button"
            className={`tabbar__item ${isActive ? 'tabbar__item--active' : ''}`}
            data-tab-id={tab.id}
            data-tab-icon-variant={iconVariant}
            onClick={() => handleTabActivate(tab)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            role="tab"
            aria-selected={isActive}
          >
            <Badge content={tab.badge} offset={[-6, 4]}>
              <div className="tabbar__icon">
                <TabbarIcon id={tab.id} variant={iconVariant} />
              </div>
            </Badge>
            <div className="tabbar__label">{tab.label}</div>
          </button>
        );
      })}
    </nav>
  );
};

