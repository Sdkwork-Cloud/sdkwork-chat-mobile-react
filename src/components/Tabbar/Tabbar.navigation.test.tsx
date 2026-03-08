import { describe, expect, it } from 'vitest';
import { APP_TABS } from '../../app/shell/navigation';
import { resolveTabClickAction } from './tabClickPolicy';

describe('resolveTabClickAction', () => {
  it('uses canonical tab path when switching tabs', () => {
    for (const tab of APP_TABS) {
      const activeTab = tab.id === 'discover' ? 'chat' : 'discover';
      const currentPath = activeTab === 'chat' ? '/conversation-list' : '/discover';
      const action = resolveTabClickAction({
        activeTab,
        targetTab: tab.id,
        targetPath: tab.path,
        currentPath,
      });

      expect(action).toEqual({ type: 'navigate', targetPath: tab.path });
    }
  });

  it('uses canonical tab path when switching to Me tab', () => {
    const action = resolveTabClickAction({
      activeTab: 'discover',
      targetTab: 'me',
      targetPath: '/me',
      currentPath: '/discover',
    });

    expect(action).toEqual({ type: 'navigate', targetPath: '/me' });
  });

  it('returns reselect action when clicking active tab on root path', () => {
    const action = resolveTabClickAction({
      activeTab: 'me',
      targetTab: 'me',
      targetPath: '/me',
      currentPath: '/me',
    });

    expect(action).toEqual({ type: 'reselect' });
  });

  it('returns tab root navigation when re-clicking active tab in nested page', () => {
    const action = resolveTabClickAction({
      activeTab: 'me',
      targetTab: 'me',
      targetPath: '/me',
      currentPath: '/wallet',
    });

    expect(action).toEqual({ type: 'navigate', targetPath: '/me' });
  });

  it('uses chat tab root when re-clicking chat tab from nested route', () => {
    const action = resolveTabClickAction({
      activeTab: 'chat',
      targetTab: 'chat',
      targetPath: '/conversation-list',
      currentPath: '/chat',
    });

    expect(action).toEqual({ type: 'navigate', targetPath: '/conversation-list' });
  });
});
