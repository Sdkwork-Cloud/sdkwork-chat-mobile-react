import React from 'react';
import { NavbarQuickActions, Page, Skeleton } from '@sdkwork/react-mobile-commons';
import type { NavbarQuickActionItem } from '@sdkwork/react-mobile-commons';
import { useDiscover } from '../hooks/useDiscover';
import { DiscoverCell, DiscoverCellGroup } from '../components';
import {
  buildServiceCellGroups,
  DISCOVER_CELL_DIVIDER_INSET,
  DISCOVER_CELL_MIN_HEIGHT,
  DISCOVER_DEFAULTS,
  type CellConfig,
} from './discoverCells';
import './DiscoverPage.css';

interface DiscoverPageProps {
  t?: (key: string) => string;
  onItemClick?: (path: string) => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ t, onItemClick, onNavigate }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { items, isLoading } = useDiscover();

  const itemMap = React.useMemo(() => {
    return new Map(items.map((item) => [item.icon, item]));
  }, [items]);

  const serviceCells = React.useMemo(
    () =>
      DISCOVER_DEFAULTS.map((item) => {
        const remote = itemMap.get(item.icon);
        return {
          ...item,
          title: tr(item.titleKey, item.fallbackTitle),
          path: remote?.path || item.path,
          color: remote?.color || item.color,
        };
      }),
    [itemMap, t]
  );

  const serviceCellGroups = React.useMemo(() => buildServiceCellGroups(serviceCells), [serviceCells]);

  const handleNavigate = React.useCallback(
    (path: string, params?: Record<string, string>) => {
      if (onNavigate) {
        onNavigate(path, params);
        return;
      }

      if (params && Object.keys(params).length > 0) {
        const query = new URLSearchParams(params).toString();
        const withQuery = path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
        onItemClick?.(withQuery);
        return;
      }

      onItemClick?.(path);
    },
    [onItemClick, onNavigate]
  );

  const handleServiceCellClick = React.useCallback(
    (item: CellConfig) => {
      handleNavigate(item.path);
    },
    [handleNavigate]
  );

  const quickActions = React.useMemo<NavbarQuickActionItem[]>(
    () => [
      { key: 'group', label: tr('menu_group_chat', '\u53d1\u8d77\u7fa4\u804a'), icon: 'group', onClick: () => handleNavigate('/contacts', { mode: 'select', action: 'create_group' }) },
      { key: 'friend', label: tr('menu_add_friend', '\u6dfb\u52a0\u670b\u53cb'), icon: 'addUser', onClick: () => handleNavigate('/add-friend') },
      { key: 'scan', label: tr('menu_scan', '\u626b\u4e00\u626b'), icon: 'scan', onClick: () => handleNavigate('/scan') },
      { key: 'pay', label: tr('menu_money', '\u6536\u4ed8\u6b3e'), icon: 'money-transfer', onClick: () => handleNavigate('/wallet') },
    ],
    [handleNavigate, t]
  );

  return (
    <Page
      title={tr('tab_discover', '\u53d1\u73b0')}
      showBack={false}
      noPadding
      background="var(--bg-body)"
      rightElement={
        <NavbarQuickActions
          onSearch={() => handleNavigate('/search')}
          actions={quickActions}
        />
      }
    >
      <div
        className="discover-page"
        style={{ '--discover-cell-min-height': `${DISCOVER_CELL_MIN_HEIGHT}px` } as React.CSSProperties}
      >
        <div className="discover-page__content">
          {isLoading ? (
            <div className="discover-page__skeleton-wrap">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Skeleton
                  key={`discover-cell-skeleton-${idx}`}
                  width="100%"
                  height={DISCOVER_CELL_MIN_HEIGHT}
                  style={{ borderRadius: 0, marginBottom: '1px' }}
                />
              ))}
            </div>
          ) : (
            <>
              {serviceCellGroups.map((group, groupIndex) => (
                <DiscoverCellGroup
                  key={`discover-service-group-${groupIndex}`}
                  dividerInsetStart={DISCOVER_CELL_DIVIDER_INSET}
                >
                  {group.map((cell, cellIndex) => (
                    <DiscoverCell
                      key={cell.key}
                      title={cell.title || cell.fallbackTitle}
                      icon={cell.icon}
                      color={cell.color}
                      isLast={cellIndex === group.length - 1}
                      onClick={() => handleServiceCellClick(cell)}
                    />
                  ))}
                </DiscoverCellGroup>
              ))}

            </>
          )}
        </div>
      </div>
    </Page>
  );
};

export default DiscoverPage;

