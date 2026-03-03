import React from 'react';
import { navigate } from '../../router';
import { useChatStoreState } from '../../stores/chatStore';
import { Badge } from '../Badge/Badge';
import { useTranslation } from '../../core/i18n/I18nContext';
import { Platform } from '../../platform';
import { APP_TABS, TAB_DEFAULT_PATHS, TabId, resolveTabByPath } from '../../app/shell/navigation';
import { appUiStateService } from '../../services/AppUiStateService';
import './Tabbar.mobile.css';

const TAB_MEMORY_KEY = 'sys_tab_last_paths_v1';

const normalizeTabPath = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const raw = value.trim();
  if (!raw) return fallback;

  try {
    const url = new URL(raw, window.location.origin);
    const compactPath = url.pathname.replace(/\/{2,}/g, '/');
    const pathname = compactPath.length <= 1 ? '/' : compactPath.replace(/\/+$/, '');
    if (!pathname.startsWith('/')) return fallback;
    return `${pathname}${url.search || ''}`;
  } catch (_error) {
    return fallback;
  }
};

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
  const tabMemoryRef = React.useRef<Record<TabId, string>>({ ...TAB_DEFAULT_PATHS });
  const clickGuardRef = React.useRef<{ ts: number; tabId: TabId | null }>({ ts: 0, tabId: null });
  const chatEntryPath = TAB_DEFAULT_PATHS.chat;

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
    try {
      const raw = appUiStateService.getSessionValue(TAB_MEMORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<TabId, unknown>>;
        tabMemoryRef.current = {
          // Chat tab should always land on session list.
          chat: TAB_DEFAULT_PATHS.chat,
          agents: normalizeTabPath(parsed.agents, TAB_DEFAULT_PATHS.agents),
          creation: normalizeTabPath(parsed.creation, TAB_DEFAULT_PATHS.creation),
          discover: normalizeTabPath(parsed.discover, TAB_DEFAULT_PATHS.discover),
          me: normalizeTabPath(parsed.me, TAB_DEFAULT_PATHS.me),
        };
      }
    } catch (_error) {
      // Ignore storage parsing errors and use defaults.
      tabMemoryRef.current = { ...TAB_DEFAULT_PATHS };
    }

    const handleRouteChange = () => {
      const currentTab = resolveTabByPath(window.location.pathname);
      setActiveTab(currentTab);

      const fullPath = `${window.location.pathname}${window.location.search || ''}`;
      if (currentTab === 'chat') {
        tabMemoryRef.current.chat = TAB_DEFAULT_PATHS.chat;
      } else {
        tabMemoryRef.current[currentTab] = fullPath;
      }
      try {
        appUiStateService.setSessionValue(TAB_MEMORY_KEY, JSON.stringify(tabMemoryRef.current));
      } catch (_error) {
        // Ignore storage failures.
      }
    };

    window.addEventListener('routechange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => {
      window.removeEventListener('routechange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleTabClick = (tab: { id: TabId; path: string }) => {
    if (!tab?.path) {
      return;
    }

    if (tab.id === 'chat') {
      navigate(chatEntryPath);
      return;
    }

    const currentPath = window.location.pathname;
    const fullPath = `${window.location.pathname}${window.location.search || ''}`;

    if (activeTab === tab.id) {
      if (currentPath !== tab.path && resolveTabByPath(currentPath) === tab.id) {
        navigate(tab.path);
        return;
      }

      window.dispatchEvent(
        new CustomEvent('tabreselect', {
          detail: { tabId: tab.id, path: currentPath },
        })
      );
      return;
    }

    try {
      Platform.device.vibrate(8);
    } catch (_error) {
      // Ignore haptics errors to keep tab navigation responsive.
    }
    setActiveTab(tab.id);

    const currentTab = resolveTabByPath(currentPath);
    tabMemoryRef.current[currentTab] = fullPath;

    const targetPath = normalizeTabPath(tabMemoryRef.current[tab.id], tab.path);
    try {
      navigate(targetPath);
    } catch (_error) {
      navigate(tab.path);
    }
  };

  const handleTabActivate = (tab: { id: TabId; path: string }) => {
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

