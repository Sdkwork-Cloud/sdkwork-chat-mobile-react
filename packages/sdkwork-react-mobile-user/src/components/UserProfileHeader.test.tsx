import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const ensureDomLikeGlobals = () => {
  if (!(globalThis as Record<string, unknown>).document) {
    (globalThis as Record<string, unknown>).document = {
      documentElement: { lang: 'en' },
    };
  }

  if (!(globalThis as Record<string, unknown>).navigator) {
    (globalThis as Record<string, unknown>).navigator = {
      language: 'en-US',
    };
  }
};

vi.mock('@sdkwork/react-mobile-commons', () => ({
  Icon: ({ name }: { name: string }) => React.createElement('i', { 'data-icon': name }),
}));

describe('UserProfileHeader', () => {
  it('renders user name, id and status placeholder', async () => {
    ensureDomLikeGlobals();
    const { UserProfileHeader } = await import('./UserProfileHeader');

    const html = renderToStaticMarkup(
      <UserProfileHeader
        name="OpenChat"
        idText="ID: openchat_001"
        statusPlaceholder="Set Status"
        avatarUrl="https://example.com/avatar.png"
      />
    );

    expect(html).toContain('OpenChat');
    expect(html).toContain('ID: openchat_001');
    expect(html).toContain('Set Status');
  });

  it('renders current status text when provided', async () => {
    ensureDomLikeGlobals();
    const { UserProfileHeader } = await import('./UserProfileHeader');

    const html = renderToStaticMarkup(
      <UserProfileHeader
        name="OpenChat"
        idText="ID: openchat_001"
        statusText="\u2728 Feeling lucky"
        avatarUrl="https://example.com/avatar.png"
      />
    );

    expect(html).toContain('Feeling lucky');
  });
});
