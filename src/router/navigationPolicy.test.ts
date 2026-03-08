import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePathname, resolveInitialPath, resolveRouteTarget } from './navigationPolicy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('navigationPolicy', () => {
  it('normalizes raw path into leading-slash compact pathname', () => {
    expect(normalizePathname('wallet')).toBe('/wallet');
    expect(normalizePathname('/wallet/')).toBe('/wallet');
    expect(normalizePathname('/wallet//details///')).toBe('/wallet/details');
    expect(normalizePathname('')).toBe('/');
  });

  it('accepts known route target', () => {
    const result = resolveRouteTarget({
      rawPath: '/me/',
      routeExists: (path) => path === '/me',
    });

    expect(result).toEqual({ ok: true, path: '/me' });
  });

  it('blocks unknown route target', () => {
    const result = resolveRouteTarget({
      rawPath: '/unknown-route',
      routeExists: (path) => path === '/me',
    });

    expect(result).toEqual({ ok: false, path: '/unknown-route', reason: 'unknown-route' });
  });

  it('falls back to default path for unknown initial URL path', () => {
    const result = resolveInitialPath({
      rawPath: '/not-found',
      fallbackPath: '/',
      routeExists: (path) => path === '/',
    });

    expect(result).toBe('/');
  });

  it('does not keep deprecated standalone-site route alias in router config', () => {
    const routerSource = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(routerSource).not.toContain("'/standalone-site'");
  });

  it('does not keep legacy route aliases in router config', () => {
    const routerSource = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(routerSource).not.toContain("'/chat-list'");
    expect(routerSource).not.toContain("'/contacts/new-friends'");
    expect(routerSource).not.toContain("'/contacts/add-friend'");
    expect(routerSource).not.toContain("'/profile/self'");
    expect(routerSource).not.toContain("'/profile/qrcode'");
    expect(routerSource).not.toContain("'/profile/invoice'");
    expect(routerSource).not.toContain("'/profile/activity-history'");
    expect(routerSource).not.toContain("'/profile/user-settings'");
    expect(routerSource).not.toContain("'/wallet-details'");
    expect(routerSource).not.toContain("'/creation-search'");
    expect(routerSource).not.toContain("'/creation-detail'");
    expect(routerSource).not.toContain("'/orders/detail'");
    expect(routerSource).not.toContain("'/social'");
    expect(routerSource).not.toContain("'/contact/profile'");
    expect(routerSource).not.toContain("'/contact-details'");
    expect(routerSource).not.toContain("'/commerce/mall'");
    expect(routerSource).not.toContain("'/commerce/category'");
    expect(routerSource).not.toContain("'/commerce/product'");
    expect(routerSource).not.toContain("'/commerce/item'");
    expect(routerSource).not.toContain("'/commerce/cart'");
    expect(routerSource).not.toContain("'/commerce/checkout'");
    expect(routerSource).not.toContain("'/commerce/distribution'");
    expect(routerSource).not.toContain("'/commerce/distribution/goods'");
    expect(routerSource).not.toContain("'/commerce/distribution/team'");
    expect(routerSource).not.toContain("'/commerce/distribution/commission'");
    expect(routerSource).not.toContain("'/commerce/distribution/rank'");
    expect(routerSource).not.toContain("'/commerce/distribution/withdraw'");
    expect(routerSource).not.toContain("'/commerce/distribution/poster'");
    expect(routerSource).not.toContain("'/discover/order-center'");
    expect(routerSource).not.toContain("'/discover/gigs'");
    expect(routerSource).not.toContain("'/cloud-drive'");
    expect(routerSource).not.toContain("'/drive-files'");
    expect(routerSource).not.toContain("'/channels'");
    expect(routerSource).not.toContain("'/video-channel'");
    expect(routerSource).not.toContain("'/mall'");
    expect(routerSource).not.toContain("'/shop'");
    expect(routerSource).not.toContain("'/commerce'");
    expect(routerSource).not.toContain("'/mall-product'");
    expect(routerSource).not.toContain("'/appointment-detail'");
    expect(routerSource).not.toContain("'/appointment-booking'");
    expect(routerSource).not.toContain("'/content-details'");
    expect(routerSource).not.toContain("'/article'");
    expect(routerSource).not.toContain("'/listen'");
    expect(routerSource).not.toContain("'/call'");
    expect(routerSource).not.toContain("'/video-call'");
    expect(routerSource).not.toContain("'/creation-editor'");
  });

  it('keeps router implementation on canonical route constants without raw path literals', () => {
    const routerSource = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');
    const literalPathPattern = /'\/[a-z0-9\-/]*'|"\/[a-z0-9\-/]+"/g;
    const literalMatches = routerSource.match(literalPathPattern) || [];

    expect(literalMatches).toEqual([]);
  });
});
