import { describe, expect, it, vi } from 'vitest';
import { executeOAuthAuthorization } from './oauthAuthorization';

describe('oauth authorization execution', () => {
  it('returns popup result for popup mode', async () => {
    const openPopup = vi.fn().mockResolvedValue({ code: 'popup-code', state: 'popup-state' });
    const beginRedirect = vi.fn();
    const openNative = vi.fn();

    await expect(
      executeOAuthAuthorization({
        mode: 'popup',
        authUrl: 'https://example.com/popup',
        redirectUri: 'https://app.example.com/auth/callback',
        popupExecutor: openPopup,
        redirectExecutor: beginRedirect,
        nativeExecutor: openNative,
        provider: 'google',
      })
    ).resolves.toEqual({
      code: 'popup-code',
      state: 'popup-state',
      transport: 'popup',
    });

    expect(openPopup).toHaveBeenCalledWith('https://example.com/popup', 'https://app.example.com/auth/callback');
    expect(beginRedirect).not.toHaveBeenCalled();
    expect(openNative).not.toHaveBeenCalled();
  });

  it('returns native bridge result for native mode', async () => {
    const openPopup = vi.fn();
    const beginRedirect = vi.fn();
    const openNative = vi.fn().mockResolvedValue({ code: 'native-code', state: 'native-state' });

    await expect(
      executeOAuthAuthorization({
        mode: 'native',
        authUrl: 'https://example.com/native',
        popupExecutor: openPopup,
        redirectExecutor: beginRedirect,
        nativeExecutor: openNative,
        provider: 'apple',
      })
    ).resolves.toEqual({
      code: 'native-code',
      state: 'native-state',
      transport: 'native',
    });

    expect(openNative).toHaveBeenCalledWith('apple');
    expect(openPopup).not.toHaveBeenCalled();
    expect(beginRedirect).not.toHaveBeenCalled();
  });

  it('invokes redirect executor for redirect mode', async () => {
    const openPopup = vi.fn();
    const beginRedirect = vi.fn().mockResolvedValue(undefined);
    const openNative = vi.fn();

    await expect(
      executeOAuthAuthorization({
        mode: 'redirect',
        authUrl: 'https://example.com/redirect',
        popupExecutor: openPopup,
        redirectExecutor: beginRedirect,
        nativeExecutor: openNative,
        provider: 'wechat',
      })
    ).resolves.toEqual({
      transport: 'redirect',
    });

    expect(beginRedirect).toHaveBeenCalledWith('https://example.com/redirect');
    expect(openPopup).not.toHaveBeenCalled();
    expect(openNative).not.toHaveBeenCalled();
  });
});
