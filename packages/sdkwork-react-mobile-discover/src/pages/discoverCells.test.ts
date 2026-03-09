import { describe, expect, it } from 'vitest';
import {
  buildServiceCellGroups,
  buildDiscoverFeaturedCells,
  DISCOVER_DEFAULTS,
  DISCOVER_CELL_DIVIDER_INSET,
  DISCOVER_CELL_MIN_HEIGHT,
  type CellConfig,
} from './discoverCells';

describe('DISCOVER_DEFAULTS', () => {
  it('replaces shake with search and keeps skills and listen entries', () => {
    const keys = DISCOVER_DEFAULTS.map((item) => item.key);

    expect(keys).toContain('search-entry');
    expect(keys).toContain('listen');
    expect(keys).toContain('skills-center');
    expect(keys).not.toContain('shake');
  });

  it('routes feature entries to independent module paths', () => {
    const routeByKey = new Map(DISCOVER_DEFAULTS.map((item) => [item.key, item.path]));

    expect(routeByKey.get('video-channel')).toBe('/video');
    expect(routeByKey.get('nearby')).toBe('/nearby');
    expect(routeByKey.get('search-entry')).toBe('/search');
    expect(routeByKey.get('drive')).toBe('/drive');
    expect(routeByKey.get('email')).toBe('/email');
    expect(routeByKey.get('notes')).toBe('/notes');
    expect(routeByKey.get('shop')).toBe('/shopping');
    expect(routeByKey.get('order-center')).toBe('/order-center');
    expect(routeByKey.get('miniapp')).toBe('/app');
    expect(routeByKey.get('look')).toBe('/look');
    expect(routeByKey.get('listen')).toBe('/media');
  });

  it('marks drive, email, notes, and order center as discover featured workspaces', () => {
    const featuredKeys = buildDiscoverFeaturedCells(DISCOVER_DEFAULTS).map((item) => item.key);

    expect(featuredKeys).toEqual(['order-center', 'drive', 'email', 'notes']);

    for (const key of featuredKeys) {
      const item = DISCOVER_DEFAULTS.find((entry) => entry.key === key);
      expect(item?.featured).toBe(true);
      expect(item?.subtitleKey).toBeTruthy();
      expect(item?.fallbackSubtitle).toBeTruthy();
      expect(item?.badgeKey).toBeTruthy();
      expect(item?.fallbackBadge).toBeTruthy();
    }
  });

  it('uses a premium cell height baseline for discover list rhythm', () => {
    expect(DISCOVER_CELL_MIN_HEIGHT).toBe(52);
  });

  it('uses icon-aligned divider inset for visual alignment', () => {
    expect(DISCOVER_CELL_DIVIDER_INSET).toBe(60);
  });
});

describe('buildServiceCellGroups', () => {
  it('keeps standalone entries as an independent group', () => {
    const source: CellConfig[] = [
      { key: 'a', titleKey: 'a', fallbackTitle: 'A', icon: 'a', color: '#000', path: '/a' },
      { key: 'b', titleKey: 'b', fallbackTitle: 'B', icon: 'b', color: '#000', path: '/b' },
      { key: 'search-entry', titleKey: 'discover.search', fallbackTitle: 'Search', icon: 'search', color: '#000', path: '/search', standaloneGroup: true },
      { key: 'c', titleKey: 'c', fallbackTitle: 'C', icon: 'c', color: '#000', path: '/c' },
    ];

    const groups = buildServiceCellGroups(source);

    expect(groups).toHaveLength(3);
    expect(groups[0].map((item) => item.key)).toEqual(['a', 'b']);
    expect(groups[1].map((item) => item.key)).toEqual(['search-entry']);
    expect(groups[2].map((item) => item.key)).toEqual(['c']);
  });
});
