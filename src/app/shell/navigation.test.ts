import { describe, expect, it } from 'vitest';
import { APP_TABS, resolveTabByPath } from './navigation';

describe('resolveTabByPath', () => {
  it('maps each tab root path to its own tab id', () => {
    for (const tab of APP_TABS) {
      expect(resolveTabByPath(tab.path)).toBe(tab.id);
    }
  });

  it('keeps me domain routes under Me tab', () => {
    const meRoutes = [
      '/me',
      '/vip',
      '/wallet',
      '/my-address',
      '/my-creations',
      '/favorites',
      '/account-security',
      '/theme',
      '/model-settings',
      '/model-config',
      '/feedback',
      '/chat-background',
      '/orders',
      '/order-detail',
      '/shopping-cart',
      '/order-confirmation',
      '/appointments',
      '/appointments/detail',
      '/settings',
    ];

    for (const path of meRoutes) {
      expect(resolveTabByPath(path)).toBe('me');
    }
  });

  it('keeps discover domain routes under Discover tab', () => {
    const discoverRoutes = [
      '/discover',
      '/moments',
      '/shopping',
      '/category',
      '/product',
      '/order-center',
      '/drive',
      '/video',
      '/video-details',
      '/article/detail',
      '/communication',
      '/look',
      '/media',
    ];

    for (const path of discoverRoutes) {
      expect(resolveTabByPath(path)).toBe('discover');
    }
  });

  it('prioritizes me route matching over shop-prefix collisions', () => {
    expect(resolveTabByPath('/shopping-cart')).toBe('me');
  });
});
