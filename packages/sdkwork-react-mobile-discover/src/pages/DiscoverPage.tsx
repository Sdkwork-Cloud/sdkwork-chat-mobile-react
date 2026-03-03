import React from 'react';
import { NavbarQuickActions, Page, Skeleton } from '@sdkwork/react-mobile-commons';
import type { NavbarQuickActionItem } from '@sdkwork/react-mobile-commons';
import { useDiscover } from '../hooks/useDiscover';
import { DiscoverCell, DiscoverCellGroup, DiscoverFeedCard, type DiscoverFeedItem } from '../components';
import './DiscoverPage.css';

interface DiscoverPageProps {
  t?: (key: string) => string;
  onItemClick?: (path: string) => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
}

interface CellConfig {
  key: string;
  title?: string;
  titleKey: string;
  fallbackTitle: string;
  icon: string;
  color: string;
  path: string;
}

const DISCOVER_DEFAULTS: CellConfig[] = [
  { key: 'moments', titleKey: 'discover.moments', fallbackTitle: '朋友圈', icon: 'moments', color: '#4080ff', path: '/moments' },
  { key: 'video-channel', titleKey: 'discover.channels', fallbackTitle: '视频号', icon: 'video-channel', color: '#ff9c6e', path: '/video-channel' },
  { key: 'scan', titleKey: 'discover.scan', fallbackTitle: '扫一扫', icon: 'scan', color: '#2979ff', path: '/scan' },
  { key: 'look', titleKey: 'discover.look', fallbackTitle: '看一看', icon: 'search', color: '#ffc300', path: '/search' },
  { key: 'shake', titleKey: 'discover.shake', fallbackTitle: '摇一摇', icon: 'shake', color: '#ff8f1f', path: '/shake' },
  { key: 'shop', titleKey: 'discover.mall', fallbackTitle: '购物', icon: 'shop', color: '#fa5151', path: '/commerce/mall' },
  { key: 'location', titleKey: 'discover.nearby_service', fallbackTitle: '附近服务', icon: 'gig', color: '#07c160', path: '/discover/gigs' },
  { key: 'miniapp', titleKey: 'discover.miniapp', fallbackTitle: '小程序', icon: 'miniapp', color: '#7928ca', path: '/agents' },
  { key: 'more', titleKey: 'common.more', fallbackTitle: '更多', icon: 'more', color: '#7f8ea7', path: '/general' },
];

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
  const recommendedFeed: DiscoverFeedItem[] = React.useMemo(
    () => [
      {
        id: 'feed-1',
        title: tr('discover.feed.1.title', 'AI 协作设计系统的 5 个落地原则'),
        source: tr('discover.feed.1.source', 'OpenChat 设计周刊'),
        cover: 'https://picsum.photos/seed/discover-feed-1/720/480',
        reads: 12880,
        route: '/article/detail?id=feed-1',
        type: 'article',
      },
      {
        id: 'feed-2',
        title: tr('discover.feed.2.title', '从会话到工作流：智能体产品架构实践'),
        source: tr('discover.feed.2.source', '产品实验室'),
        cover: 'https://picsum.photos/seed/discover-feed-2/720/480',
        reads: 9680,
        route: '/article/detail?id=feed-2',
        type: 'video',
      },
      {
        id: 'feed-3',
        title: tr('discover.feed.3.title', '移动端聊天页性能优化清单'),
        source: tr('discover.feed.3.source', '前端引擎组'),
        cover: 'https://picsum.photos/seed/discover-feed-3/720/480',
        reads: 7530,
        route: '/article/detail?id=feed-3',
        type: 'article',
      },
      {
        id: 'feed-4',
        title: tr('discover.feed.4.title', '多智能体协作：从策略到执行'),
        source: tr('discover.feed.4.source', '智能体研究社'),
        cover: 'https://picsum.photos/seed/discover-feed-4/720/480',
        reads: 11220,
        route: '/article/detail?id=feed-4',
        type: 'video',
      },
    ],
    [t]
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
      if (item.key === 'more') {
        handleNavigate('/general', { title: tr('settings.general', '通用'), from: 'discover' });
        return;
      }
      handleNavigate(item.path);
    },
    [handleNavigate, t]
  );

  const quickActions = React.useMemo<NavbarQuickActionItem[]>(
    () => [
      { key: 'group', label: tr('menu_group_chat', '发起群聊'), icon: 'group', onClick: () => handleNavigate('/contacts', { mode: 'select', action: 'create_group' }) },
      { key: 'friend', label: tr('menu_add_friend', '添加朋友'), icon: 'addUser', onClick: () => handleNavigate('/add-friend') },
      { key: 'scan', label: tr('menu_scan', '扫一扫'), icon: 'scan', onClick: () => handleNavigate('/scan') },
      { key: 'pay', label: tr('menu_money', '收付款'), icon: 'money-transfer', onClick: () => handleNavigate('/wallet') },
    ],
    [handleNavigate, t]
  );

  return (
    <Page
      title={tr('tab_discover', '发现')}
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
      <div className="discover-page">
        <div className="discover-page__content">
          {isLoading ? (
            <div className="discover-page__skeleton-wrap">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Skeleton
                  key={`discover-cell-skeleton-${idx}`}
                  width="100%"
                  height={52}
                  style={{ borderRadius: '12px', marginBottom: '8px' }}
                />
              ))}
            </div>
          ) : (
            <>
              <DiscoverCellGroup>
                <DiscoverCell
                  title={serviceCells[0].title || serviceCells[0].fallbackTitle}
                  icon={serviceCells[0].icon}
                  color={serviceCells[0].color}
                  onClick={() => handleServiceCellClick(serviceCells[0])}
                />
                <DiscoverCell
                  title={serviceCells[1].title || serviceCells[1].fallbackTitle}
                  icon={serviceCells[1].icon}
                  color={serviceCells[1].color}
                  isLast
                  onClick={() => handleServiceCellClick(serviceCells[1])}
                />
              </DiscoverCellGroup>

              <DiscoverCellGroup>
                <DiscoverCell
                  title={serviceCells[2].title || serviceCells[2].fallbackTitle}
                  icon={serviceCells[2].icon}
                  color={serviceCells[2].color}
                  onClick={() => handleServiceCellClick(serviceCells[2])}
                />
                <DiscoverCell
                  title={serviceCells[3].title || serviceCells[3].fallbackTitle}
                  icon={serviceCells[3].icon}
                  color={serviceCells[3].color}
                  isLast
                  onClick={() => handleServiceCellClick(serviceCells[3])}
                />
              </DiscoverCellGroup>

              <DiscoverCellGroup>
                <DiscoverCell
                  title={serviceCells[4].title || serviceCells[4].fallbackTitle}
                  icon={serviceCells[4].icon}
                  color={serviceCells[4].color}
                  onClick={() => handleServiceCellClick(serviceCells[4])}
                />
                <DiscoverCell
                  title={serviceCells[5].title || serviceCells[5].fallbackTitle}
                  icon={serviceCells[5].icon}
                  color={serviceCells[5].color}
                  isLast
                  onClick={() => handleServiceCellClick(serviceCells[5])}
                />
              </DiscoverCellGroup>

              <DiscoverCellGroup>
                <DiscoverCell
                  title={serviceCells[6].title || serviceCells[6].fallbackTitle}
                  icon={serviceCells[6].icon}
                  color={serviceCells[6].color}
                  onClick={() => handleServiceCellClick(serviceCells[6])}
                />
                <DiscoverCell
                  title={serviceCells[7].title || serviceCells[7].fallbackTitle}
                  icon={serviceCells[7].icon}
                  color={serviceCells[7].color}
                  onClick={() => handleServiceCellClick(serviceCells[7])}
                />
                <DiscoverCell
                  title={serviceCells[8].title || serviceCells[8].fallbackTitle}
                  icon={serviceCells[8].icon}
                  color={serviceCells[8].color}
                  isLast
                  onClick={() => handleServiceCellClick(serviceCells[8])}
                />
              </DiscoverCellGroup>

              <DiscoverCellGroup>
                <DiscoverCell
                  title={tr('discover.creation_center', '创作中心')}
                  icon="creation"
                  color="#ff9c6e"
                  onClick={() => handleNavigate('/creation')}
                />
                <DiscoverCell
                  title={tr('discover.agent_square', '智能体广场')}
                  icon="agents"
                  color="#7928ca"
                  isLast
                  onClick={() => handleNavigate('/agents')}
                />
              </DiscoverCellGroup>

              <div className="discover-page__section-head">
                <span className="discover-page__section-bar" aria-hidden="true" />
                <h2>{tr('discover.recommended_content', '推荐内容')}</h2>
              </div>
              <div className="discover-page__feed-grid">
                {recommendedFeed.map((item) => (
                  <DiscoverFeedCard
                    key={item.id}
                    item={item}
                    onClick={(route) => {
                      handleNavigate(route);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
};

export default DiscoverPage;
