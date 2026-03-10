import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('OAuthCallbackPage wiring', () => {
  it('parses callback params and completes social login with provider payload', () => {
    const source = fs.readFileSync(path.join(__dirname, 'OAuthCallbackPage.tsx'), 'utf8');

    expect(source).toContain('parseOAuthCallbackParams');
    expect(source).toContain('extractOAuthCallbackProviderHint');
    expect(source).toContain('loginWithSocial({');
    expect(source).toContain('provider: parsed.provider');
    expect(source).toContain('code: parsed.code');
    expect(source).toContain('state: parsed.state');
  });

  it('renders provider-aware callback states and delayed success navigation', () => {
    const source = fs.readFileSync(path.join(__dirname, 'OAuthCallbackPage.tsx'), 'utf8');

    expect(source).toContain("kind: 'success'");
    expect(source).toContain('window.setTimeout');
    expect(source).toContain('status.providerName');
    expect(source).toContain('status.detail');
    expect(source).toContain("auth_oauth_callback_success_title");
    expect(source).toContain("auth_oauth_callback_continue");
    expect(source).toContain("auth_oauth_callback_invalid");
    expect(source).toContain("auth_oauth_callback_back");
  });
});
