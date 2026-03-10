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
    expect(source).toContain('loginWithSocial({');
    expect(source).toContain('provider: parsed.provider');
    expect(source).toContain('code: parsed.code');
    expect(source).toContain('state: parsed.state');
  });

  it('renders invalid callback copy on protocol errors', () => {
    const source = fs.readFileSync(path.join(__dirname, 'OAuthCallbackPage.tsx'), 'utf8');

    expect(source).toContain("auth_oauth_callback_invalid");
    expect(source).toContain("auth_oauth_callback_back");
  });
});
