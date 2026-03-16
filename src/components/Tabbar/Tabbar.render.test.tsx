import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockUseChatStoreState = vi.fn();
const mockUseTranslation = vi.fn();

vi.mock('../../router', () => ({
  navigate: (...args: unknown[]) => mockNavigate(...args),
}));

vi.mock('../../stores/chatStore', () => ({
  useChatStoreState: () => mockUseChatStoreState(),
}));

vi.mock('../../core/i18n/I18nContext', () => ({
  useTranslation: () => mockUseTranslation(),
}));

vi.mock('../../platform', () => ({
  Platform: {
    device: {
      vibrate: vi.fn(),
    },
  },
}));

describe('Tabbar render state', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseChatStoreState.mockReturnValue({ totalUnreadCount: 7 });
    mockUseTranslation.mockReturnValue({
      t: (key: string) =>
        ({
          tab_chat: 'Chat',
          tab_agents: 'Agents',
          tab_creation: 'Create',
          tab_discover: 'Discover',
          tab_me: 'Me',
        })[key] ?? key,
    });

    vi.stubGlobal('window', {
      location: { pathname: '/discover' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  it('renders borderless glyph icons with a lobster agents tab and no active indicator', async () => {
    const { Tabbar } = await import('./Tabbar');
    const html = renderToStaticMarkup(<Tabbar />);

    expect(html).toContain('data-tab-id="discover"');
    expect(html).toContain('data-tab-icon-variant="filled"');
    expect(html).toContain('data-tab-id="chat"');
    expect(html).toContain('data-tab-icon-variant="outline"');
    expect(html).toContain('data-tab-id="agents"');
    expect(html).toContain('data-tab-icon-name="lobster"');
    expect(html).not.toContain('data-tab-active-indicator="true"');
    expect(html).not.toContain('tabbar__icon-shell');
    expect(html).toContain('>7<');
  });
});
