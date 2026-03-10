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
  it('renders domestic oauth providers including wechat and qq', () => {
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
    expect(html).toContain('Browser handoff');
    expect(html).toContain('Returns here after authorization');
  });

  it('renders international oauth providers without wechat or qq', () => {
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
    expect(html).toContain('Native app');
    expect(html).toContain('Uses installed provider app when available');
  });
});
