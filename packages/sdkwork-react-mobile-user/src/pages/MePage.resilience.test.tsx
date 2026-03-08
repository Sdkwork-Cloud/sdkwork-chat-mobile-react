import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const mockUseUser = vi.fn();

vi.mock('../hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}));

vi.mock('../components/UserProfileHeader', () => ({
  UserProfileHeader: (props: { name?: string; idText?: string }) => (
    <div data-testid="mock-user-profile-header">
      <span>{props.name || ''}</span>
      <span>{props.idText || ''}</span>
    </div>
  ),
}));

vi.mock('@sdkwork/react-mobile-commons', () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CellGroup: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  CellItem: ({ title, value }: { title?: string; value?: React.ReactNode }) => (
    <div>
      <span>{title || ''}</span>
      {value ? <span>{value}</span> : null}
    </div>
  ),
  Icon: ({ name }: { name: string }) => <i data-icon={name} />,
  Skeleton: () => <div data-testid="mock-skeleton">loading</div>,
  Toast: {
    success: vi.fn(),
  },
}));

describe('MePage resilience rendering', () => {
  it('keeps header visible with fallback text when profile is unavailable and loading has finished', async () => {
    mockUseUser.mockReturnValue({
      profile: null,
      isLoading: false,
      error: 'Failed to load profile',
      loadProfile: vi.fn(),
    });

    const { MePage } = await import('./MePage');
    const html = renderToStaticMarkup(<MePage t={(key) => key} />);

    expect(html).toContain('mock-user-profile-header');
    expect(html).toContain('WeChat User');
    expect(html).toContain('ID: --');
    expect(html).toContain('Profile refresh failed. Showing available local data.');
    expect(html).toContain('Refresh');
  });

  it('shows loading skeleton only when profile is absent and still loading', async () => {
    mockUseUser.mockReturnValue({
      profile: null,
      isLoading: true,
      error: null,
      loadProfile: vi.fn(),
    });

    const { MePage } = await import('./MePage');
    const html = renderToStaticMarkup(<MePage t={(key) => key} />);

    expect(html).toContain('mock-skeleton');
    expect(html).not.toContain('mock-user-profile-header');
  });
});
