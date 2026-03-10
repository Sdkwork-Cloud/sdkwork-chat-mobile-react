import { describe, expect, it } from 'vitest';
import {
  inferAuthMarketFromLocale,
  resolveAuthMarket,
  resolveRuntimeAuthMarket,
} from './authMarket';
import {
  buildOAuthProviderDeck,
  getAvailableOAuthProviders,
  getOAuthProviderById,
} from './oauthProviders';
import {
  parseOAuthCallbackParams,
  resolveOAuthInteractionMode,
} from './oauthFlow';
import type { OAuthInteractionRuntime } from './oauthTypes';

const desktopWebRuntime: OAuthInteractionRuntime = {
  platform: 'web',
  isNative: false,
  isIOS: false,
  isAndroid: false,
  prefersRedirect: false,
};

const mobileWebRuntime: OAuthInteractionRuntime = {
  platform: 'web',
  isNative: false,
  isIOS: true,
  isAndroid: false,
  prefersRedirect: true,
};

describe('regional oauth protocol', () => {
  it('infers domestic market from simplified chinese locale', () => {
    expect(inferAuthMarketFromLocale('zh-CN')).toBe('cn');
    expect(inferAuthMarketFromLocale('zh')).toBe('cn');
  });

  it('infers global market from non-chinese locale', () => {
    expect(inferAuthMarketFromLocale('en-US')).toBe('global');
    expect(inferAuthMarketFromLocale('ja-JP')).toBe('global');
  });

  it('resolves explicit market before locale inference', () => {
    expect(resolveAuthMarket({ requestedMarket: 'cn', locale: 'en-US' })).toBe('cn');
    expect(resolveAuthMarket({ requestedMarket: 'global', locale: 'zh-CN' })).toBe('global');
  });

  it('resolves runtime market from env before locale inference', () => {
    expect(
      resolveRuntimeAuthMarket({
        requestedMarket: 'auto',
        envMarket: 'global',
        locale: 'zh-CN',
      })
    ).toBe('global');
  });

  it('falls back to injected global market when env market is absent', () => {
    expect(
      resolveRuntimeAuthMarket({
        requestedMarket: 'auto',
        globalMarket: 'cn',
        locale: 'en-US',
      })
    ).toBe('cn');
  });

  it('returns domestic providers with qq support', () => {
    const ids = getAvailableOAuthProviders({ market: 'cn', runtime: desktopWebRuntime }).map((item) => item.id);

    expect(ids).toContain('wechat');
    expect(ids).toContain('qq');
    expect(ids.indexOf('wechat')).toBeLessThan(ids.indexOf('github'));
  });

  it('returns international providers without wechat or qq', () => {
    const ids = getAvailableOAuthProviders({ market: 'global', runtime: desktopWebRuntime }).map((item) => item.id);

    expect(ids).toContain('google');
    expect(ids).toContain('apple');
    expect(ids).not.toContain('wechat');
    expect(ids).not.toContain('qq');
  });

  it('selects popup for desktop google and redirect for mobile wechat', () => {
    const google = getOAuthProviderById('google');
    const wechat = getOAuthProviderById('wechat');

    expect(resolveOAuthInteractionMode(google, desktopWebRuntime)).toBe('popup');
    expect(resolveOAuthInteractionMode(wechat, mobileWebRuntime)).toBe('redirect');
  });

  it('builds provider deck with runtime-aware experience hints', () => {
    expect(buildOAuthProviderDeck({ market: 'cn', runtime: mobileWebRuntime })[0]).toMatchObject({
      id: 'wechat',
      mode: 'redirect',
      modeLabel: 'Browser handoff',
      hint: 'Returns here after authorization',
      isRecommended: true,
    });

    expect(buildOAuthProviderDeck({ market: 'global', runtime: desktopWebRuntime })[0]).toMatchObject({
      id: 'google',
      mode: 'popup',
      modeLabel: 'Quick popup',
      hint: 'Opens a secure sign-in window',
      isRecommended: true,
    });
  });

  it('parses successful callback params', () => {
    expect(parseOAuthCallbackParams('?provider=qq&code=oauth-code&state=nonce')).toEqual({
      provider: 'qq',
      code: 'oauth-code',
      state: 'nonce',
      error: undefined,
    });
  });

  it('rejects callback params without provider', () => {
    expect(() => parseOAuthCallbackParams('?code=oauth-code')).toThrow('OAuth provider is required');
  });

  it('rejects callback params without code when no error is present', () => {
    expect(() => parseOAuthCallbackParams('?provider=google')).toThrow('OAuth code is required');
  });
});
