import { describe, expect, it } from 'vitest';
import enUS from './en-US';
import zhCN from './zh-CN';

describe('auth oauth locale coverage', () => {
  it('exposes regional oauth labels in en-US resources', () => {
    expect(enUS.auth_oauth_domestic_title).toBeTruthy();
    expect(enUS.auth_oauth_global_title).toBeTruthy();
    expect(enUS.auth_oauth_recommended).toBeTruthy();
    expect(enUS.auth_oauth_mode_redirect).toBeTruthy();
    expect(enUS.auth_oauth_mode_native_hint).toBeTruthy();
    expect(enUS.auth_oauth_callback_title).toBeTruthy();
    expect(enUS.auth_oauth_callback_invalid).toBeTruthy();
  });

  it('exposes regional oauth labels in zh-CN resources', () => {
    expect(zhCN.auth_oauth_domestic_title).toBeTruthy();
    expect(zhCN.auth_oauth_global_title).toBeTruthy();
    expect(zhCN.auth_oauth_recommended).toBeTruthy();
    expect(zhCN.auth_oauth_mode_redirect).toBeTruthy();
    expect(zhCN.auth_oauth_mode_native_hint).toBeTruthy();
    expect(zhCN.auth_oauth_callback_title).toBeTruthy();
    expect(zhCN.auth_oauth_callback_invalid).toBeTruthy();
  });
});
