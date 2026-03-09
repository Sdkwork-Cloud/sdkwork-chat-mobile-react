export interface CellConfig {
  key: string;
  title?: string;
  titleKey: string;
  fallbackTitle: string;
  subtitle?: string;
  subtitleKey?: string;
  fallbackSubtitle?: string;
  badge?: string;
  badgeKey?: string;
  fallbackBadge?: string;
  icon: string;
  color: string;
  path: string;
  featured?: boolean;
  standaloneGroup?: boolean;
}

export const DISCOVER_CELL_MIN_HEIGHT = 52;
export const DISCOVER_CELL_DIVIDER_INSET = 60;

export const DISCOVER_DEFAULTS: CellConfig[] = [
  { key: 'moments', titleKey: 'discover.moments', fallbackTitle: '\u670b\u53cb\u5708', icon: 'moments', color: '#4080ff', path: '/moments' },
  { key: 'video-channel', titleKey: 'discover.channels', fallbackTitle: '\u89c6\u9891\u53f7', icon: 'video-channel', color: '#ff9c6e', path: '/video' },
  { key: 'scan', titleKey: 'discover.scan', fallbackTitle: '\u626b\u4e00\u626b', icon: 'scan', color: '#2979ff', path: '/scan' },
  { key: 'search-entry', titleKey: 'discover.search', fallbackTitle: '\u641c\u4e00\u641c', icon: 'search', color: '#ffc300', path: '/search', standaloneGroup: true },
  { key: 'shop', titleKey: 'discover.mall', fallbackTitle: '\u8d2d\u7269', icon: 'shop', color: '#fa5151', path: '/shopping' },
  {
    key: 'order-center',
    titleKey: 'discover.order_center',
    fallbackTitle: '\u63a5\u5355\u4e2d\u5fc3',
    subtitleKey: 'discover.order_center_subtitle',
    fallbackSubtitle: '\u63a5\u5355\u3001\u4ea4\u4ed8\u4e0e\u7ed3\u7b97',
    badgeKey: 'discover.workspace_badge',
    fallbackBadge: 'Workspace',
    icon: 'gig',
    color: '#07c160',
    path: '/order-center',
    featured: true,
  },
  { key: 'nearby', titleKey: 'discover.nearby', fallbackTitle: '\u9644\u8fd1', icon: 'location', color: '#13c2c2', path: '/nearby' },
  { key: 'miniapp', titleKey: 'discover.miniapp', fallbackTitle: '\u5e94\u7528', icon: 'miniapp', color: '#7928ca', path: '/app' },
  {
    key: 'drive',
    titleKey: 'discover.drive',
    fallbackTitle: '\u7f51\u76d8',
    subtitleKey: 'discover.drive_subtitle',
    fallbackSubtitle: '\u6587\u4ef6\u3001\u5206\u7c7b\u4e0e\u7a7a\u95f4',
    badgeKey: 'discover.workspace_badge',
    fallbackBadge: 'Workspace',
    icon: 'drive',
    color: '#5b8ff9',
    path: '/drive',
    featured: true,
  },
  {
    key: 'email',
    titleKey: 'discover.email',
    fallbackTitle: '\u90ae\u7bb1',
    subtitleKey: 'discover.email_subtitle',
    fallbackSubtitle: '\u6536\u4ef6\u7bb1\u3001\u5df2\u53d1\u9001\u4e0e\u5171\u4eab\u7a7a\u95f4',
    badgeKey: 'discover.workspace_badge',
    fallbackBadge: 'Workspace',
    icon: 'email',
    color: '#6f7f95',
    path: '/email',
    featured: true,
  },
  {
    key: 'notes',
    titleKey: 'discover.notes',
    fallbackTitle: '\u534f\u4f5c\u7b14\u8bb0',
    subtitleKey: 'discover.notes_subtitle',
    fallbackSubtitle: '\u6587\u6863\u3001\u4efb\u52a1\u4e0e Wiki \u534f\u540c',
    badgeKey: 'discover.workspace_badge',
    fallbackBadge: 'Workspace',
    icon: 'book',
    color: '#4f46e5',
    path: '/notes',
    featured: true,
  },
  { key: 'skills-center', titleKey: 'discover.skills_center', fallbackTitle: 'Skills\u4e2d\u5fc3', icon: 'sparkles', color: '#6f42c1', path: '/skills' },
  { key: 'look', titleKey: 'discover.look', fallbackTitle: '\u770b\u4e00\u770b', icon: 'book', color: '#ff8f1f', path: '/look' },
  { key: 'listen', titleKey: 'discover.listen', fallbackTitle: '\u5a92\u4f53\u4e2d\u5fc3', icon: 'voice', color: '#ff7a45', path: '/media' },
];

export const buildDiscoverFeaturedCells = (serviceCells: CellConfig[]): CellConfig[] =>
  serviceCells.filter((item) => item.featured);

export const buildServiceCellGroups = (serviceCells: CellConfig[]): CellConfig[][] => {
  const groups: CellConfig[][] = [];
  let buffer: CellConfig[] = [];
  serviceCells.forEach((item) => {
    if (item.standaloneGroup) {
      if (buffer.length > 0) {
        groups.push(buffer);
        buffer = [];
      }
      groups.push([item]);
      return;
    }

    buffer.push(item);
    if (buffer.length === 2) {
      groups.push(buffer);
      buffer = [];
    }
  });

  if (buffer.length > 0) {
    groups.push(buffer);
  }

  return groups;
};
