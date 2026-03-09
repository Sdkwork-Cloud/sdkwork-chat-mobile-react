import React from 'react';
import { Icon, NavbarQuickActions, Page, Skeleton } from '@sdkwork/react-mobile-commons';
import type { NavbarQuickActionItem } from '@sdkwork/react-mobile-commons';
import { useDiscover } from '../hooks/useDiscover';
import { DiscoverCell, DiscoverCellGroup } from '../components';
import {
  buildDiscoverFeaturedCells,
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
    [itemMap, tr]
  );

  const featuredCells = React.useMemo(
    () =>
      buildDiscoverFeaturedCells(serviceCells).map((item) => ({
        ...item,
        subtitle:
          item.subtitle ??
          (item.subtitleKey ? tr(item.subtitleKey, item.fallbackSubtitle ?? '') : item.fallbackSubtitle ?? ''),
        badge:
          item.badge ??
          (item.badgeKey ? tr(item.badgeKey, item.fallbackBadge ?? '') : item.fallbackBadge ?? ''),
      })),
    [serviceCells, tr]
  );

  const secondaryServiceCells = React.useMemo(
    () => serviceCells.filter((item) => !item.featured),
    [serviceCells]
  );

  const serviceCellGroups = React.useMemo(
    () => buildServiceCellGroups(secondaryServiceCells),
    [secondaryServiceCells]
  );

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

  const renderSectionHeading = React.useCallback(
    (title: string, badge: string, subtitle?: string) => (
      <div className="discover-page__section-heading">
        <div className="discover-page__section-heading-main">
          <div className="discover-page__section-kicker">{tr('tab_discover', 'Discover')}</div>
          <div className="discover-page__section-title-row">
            <h2 className="discover-page__section-title">{title}</h2>
            <span className="discover-page__section-badge">{badge}</span>
          </div>
          {subtitle ? <p className="discover-page__section-subtitle">{subtitle}</p> : null}
        </div>
      </div>
    ),
    [tr]
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
          <section className="discover-page__hero">
            <div className="discover-page__hero-copy">
              <div className="discover-page__hero-kicker">{tr('discover.workspace_badge', 'Workspace')}</div>
              <div className="discover-page__hero-title-row">
                <h1 className="discover-page__hero-title">{tr('discover.hero_title', 'Workspaces and services')}</h1>
                <span className="discover-page__hero-badge">{featuredCells.length}</span>
              </div>
              <p className="discover-page__hero-subtitle">
                {tr(
                  'discover.hero_subtitle',
                  'Jump into high-frequency modules first, then browse the rest of your service directory.'
                )}
              </p>
            </div>

            <div className="discover-page__hero-metrics">
              <div className="discover-page__hero-metric">
                <span className="discover-page__hero-metric-label">
                  {tr('discover.featured_title', 'Featured workspaces')}
                </span>
                <strong className="discover-page__hero-metric-value">{featuredCells.length}</strong>
              </div>
              <div className="discover-page__hero-metric">
                <span className="discover-page__hero-metric-label">
                  {tr('discover.services_title', 'More services')}
                </span>
                <strong className="discover-page__hero-metric-value">{secondaryServiceCells.length}</strong>
              </div>
            </div>
          </section>

          {renderSectionHeading(
            tr('discover.featured_title', 'Featured workspaces'),
            String(featuredCells.length),
            tr('discover.workspace_badge', 'Workspace')
          )}

          <section className="discover-page__featured-grid" aria-label={tr('discover.featured_title', 'Featured workspaces')}>
            {featuredCells.map((cell) => (
              <button
                key={cell.key}
                type="button"
                className="discover-page__featured-card"
                onClick={() => handleServiceCellClick(cell)}
                style={
                  {
                    '--discover-featured-color': cell.color,
                    borderTop: `4px solid ${cell.color}`,
                  } as React.CSSProperties
                }
              >
                <div className="discover-page__featured-card-top">
                  <span
                    className="discover-page__featured-card-icon"
                    aria-hidden="true"
                    style={{
                      background: `${cell.color}14`,
                      boxShadow: `inset 0 0 0 1px ${cell.color}20`,
                    }}
                  >
                    <Icon name={cell.icon} size={24} color={cell.color} />
                  </span>
                  {cell.badge ? <span className="discover-page__featured-card-badge">{cell.badge}</span> : null}
                </div>
                <div className="discover-page__featured-card-title">{cell.title || cell.fallbackTitle}</div>
                {cell.subtitle ? <div className="discover-page__featured-card-subtitle">{cell.subtitle}</div> : null}
              </button>
            ))}
          </section>

          {renderSectionHeading(
            tr('discover.services_title', 'More services'),
            String(secondaryServiceCells.length)
          )}

          {isLoading ? (
            <div className="discover-page__skeleton-wrap">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton
                  key={`discover-cell-skeleton-${idx}`}
                  width="100%"
                  height={DISCOVER_CELL_MIN_HEIGHT}
                  style={{ borderRadius: idx % 2 === 0 ? '22px 22px 0 0' : 0, marginBottom: '1px' }}
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

