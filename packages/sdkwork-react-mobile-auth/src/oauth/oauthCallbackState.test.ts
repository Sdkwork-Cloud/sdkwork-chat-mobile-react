import { describe, expect, it } from 'vitest';
import {
  buildOAuthCallbackStatusMeta,
  extractOAuthCallbackProviderHint,
} from './oauthCallbackState';

describe('oauth callback state', () => {
  it('extracts provider hint from callback query without requiring a full parse', () => {
    expect(extractOAuthCallbackProviderHint('?provider=wechat&error=access_denied')).toBe('wechat');
    expect(extractOAuthCallbackProviderHint('?provider=google&code=oauth-code')).toBe('google');
  });

  it('ignores unsupported provider hints', () => {
    expect(extractOAuthCallbackProviderHint('?provider=unknown')).toBeUndefined();
    expect(extractOAuthCallbackProviderHint('')).toBeUndefined();
  });

  it('builds success metadata with provider context and redirect countdown', () => {
    expect(
      buildOAuthCallbackStatusMeta({
        kind: 'success',
        provider: 'google',
        redirectDelayMs: 1200,
      })
    ).toMatchObject({
      kind: 'success',
      providerName: 'Google',
      tone: 'success',
      iconGlyph: 'OK',
      showBackAction: false,
      showPrimaryAction: true,
      primaryActionIntent: 'continue',
      countdownSeconds: 2,
      autoRedirectMs: 1200,
    });
  });

  it('builds failed metadata with provider detail and back action', () => {
    expect(
      buildOAuthCallbackStatusMeta({
        kind: 'failed',
        provider: 'qq',
        detail: 'access_denied',
      })
    ).toMatchObject({
      kind: 'failed',
      providerName: 'QQ',
      tone: 'danger',
      iconGlyph: '!',
      showBackAction: true,
      showPrimaryAction: true,
      primaryActionIntent: 'back',
      detail: 'access_denied',
    });
  });

  it('builds invalid metadata without provider context', () => {
    expect(
      buildOAuthCallbackStatusMeta({
        kind: 'invalid',
      })
    ).toMatchObject({
      kind: 'invalid',
      providerName: undefined,
      tone: 'danger',
      iconGlyph: '!',
      showBackAction: true,
      showPrimaryAction: true,
      primaryActionIntent: 'back',
    });
  });
});
