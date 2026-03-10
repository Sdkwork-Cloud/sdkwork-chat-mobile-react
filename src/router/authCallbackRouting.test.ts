import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('auth callback routing', () => {
  it('registers auth callback path and public route wiring', () => {
    const pathsSource = fs.readFileSync(path.join(__dirname, 'paths.ts'), 'utf8');
    const routerSource = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(pathsSource).toContain("authCallback: '/auth/callback'");
    expect(routerSource).toContain("const OAuthCallbackPage = lazyExport(() => import('@sdkwork/react-mobile-auth'), (m) => m.OAuthCallbackPage);");
    expect(routerSource).toContain('[ROUTE_PATHS.authCallback]: { component: OAuthCallbackPage, useLayout: false, public: true }');
  });
});
