import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveTabByPathMeta } from './navigation';
import { ROUTE_PATHS } from '../../router/paths';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTER_SOURCE_PATH = path.join(__dirname, '../../router/index.tsx');
const PUBLIC_ROUTES = new Set(['/login', '/register', '/forgot-password', '/auth/callback']);

const extractRoutePaths = (): string[] => {
  const source = fs.readFileSync(ROUTER_SOURCE_PATH, 'utf8');
  const paths = source
    .split('\n')
    .map((line) => {
      const literal = line.match(/^\s*'([^']+)':\s*\{/);
      if (literal?.[1]) return literal[1];

      const computed = line.match(/^\s*\[ROUTE_PATHS\.([a-zA-Z0-9_]+)\]:\s*\{/);
      if (!computed?.[1]) return undefined;

      const key = computed[1] as keyof typeof ROUTE_PATHS;
      return ROUTE_PATHS[key];
    })
    .filter((value): value is string => Boolean(value));
  return paths;
};

describe('tab route ownership coverage', () => {
  it('ensures every non-public route is explicitly owned by a tab rule', () => {
    const routePaths = extractRoutePaths().filter((routePath) => !PUBLIC_ROUTES.has(routePath));
    const unmatched = routePaths.filter((routePath) => !resolveTabByPathMeta(routePath).matchedRule);

    expect(unmatched).toEqual([]);
  });
});
