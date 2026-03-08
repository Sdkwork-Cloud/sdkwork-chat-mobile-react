export interface CellConfig {
  key: string;
  title?: string;
  titleKey: string;
  fallbackTitle: string;
  icon: string;
  color: string;
  path: string;
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
  { key: 'order-center', titleKey: 'discover.order_center', fallbackTitle: '\u63a5\u5355\u4e2d\u5fc3', icon: 'gig', color: '#07c160', path: '/order-center' },
  { key: 'nearby', titleKey: 'discover.nearby', fallbackTitle: '\u9644\u8fd1', icon: 'location', color: '#13c2c2', path: '/nearby' },
  { key: 'miniapp', titleKey: 'discover.miniapp', fallbackTitle: '\u5e94\u7528', icon: 'miniapp', color: '#7928ca', path: '/app' },
  { key: 'drive', titleKey: 'discover.drive', fallbackTitle: '\u7f51\u76d8', icon: 'drive', color: '#5b8ff9', path: '/drive' },
  { key: 'skills-center', titleKey: 'discover.skills_center', fallbackTitle: 'Skills\u4e2d\u5fc3', icon: 'sparkles', color: '#6f42c1', path: '/skills' },
  { key: 'look', titleKey: 'discover.look', fallbackTitle: '\u770b\u4e00\u770b', icon: 'book', color: '#ff8f1f', path: '/look' },
  { key: 'listen', titleKey: 'discover.listen', fallbackTitle: '\u5a92\u4f53\u4e2d\u5fc3', icon: 'voice', color: '#ff7a45', path: '/media' },
];

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
