import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoginPage } from './LoginPage';
import type { OAuthInteractionRuntime } from '../oauth/oauthTypes';

const mobileWebRuntime: OAuthInteractionRuntime = {
  platform: 'web',
  isNative: false,
  isIOS: true,
  isAndroid: false,
  prefersRedirect: true,
};

const nativeIOSRuntime: OAuthInteractionRuntime = {
  platform: 'native',
  isNative: true,
  isIOS: true,
  isAndroid: false,
  prefersRedirect: false,
};

describe('LoginPage provider deck', () => {
  it('renders domestic oauth providers without extra explainer copy', () => {
    const html = renderToStaticMarkup(
      <LoginPage
        market="cn"
        locale="zh-CN"
        runtime={mobileWebRuntime}
        t={(key) => key}
      />
    );

    expect(html).toContain('WeChat');
    expect(html).toContain('QQ');
    expect(html).not.toContain('Domestic sign in');
    expect(html).not.toContain('Optimized for WeChat, QQ and cross-border fallback providers.');
    expect(html).not.toContain('Browser handoff');
    expect(html).not.toContain('Returns here after authorization');
    expect(html).not.toContain('Best fit');
  });

  it('renders international oauth providers without extra explainer copy', () => {
    const html = renderToStaticMarkup(
      <LoginPage
        market="global"
        locale="en-US"
        runtime={nativeIOSRuntime}
        t={(key) => key}
      />
    );

    expect(html).toContain('Google');
    expect(html).toContain('Apple');
    expect(html).not.toContain('WeChat');
    expect(html).not.toContain('QQ');
    expect(html).not.toContain('International sign in');
    expect(html).not.toContain('Optimized for Google, Apple and globally available providers.');
    expect(html).not.toContain('Native app');
    expect(html).not.toContain('Uses installed provider app when available');
    expect(html).not.toContain('Best fit');
  });
});
