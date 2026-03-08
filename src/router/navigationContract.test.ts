import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('router navigation contract', () => {
  it('keeps navigation API constrained to route-path types instead of loose strings', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("import { ROUTE_PATHS, type RoutePath, type RoutePathInput } from './paths';");
    expect(source).toContain('const routes: Record<RoutePath, RouteConfig> = {');
    expect(source).toContain('const routeExists = (path: string): path is RoutePath =>');
    expect(source).toContain('export const navigate = (path: RoutePathInput, params?: Record<string, string>) => {');
    expect(source).toContain('export const navigateBack = (fallbackPath: RoutePathInput = ROUTE_PATHS.root) => {');
    expect(source).toContain('const navigateExternal = (');

    expect(source).not.toContain('type RoutePathInput = RoutePath | `${RoutePath}?${string}`;');
    expect(source).not.toContain('export const navigate = (path: string, params?: Record<string, string>) => {');
    expect(source).not.toContain('export const navigateBack = (fallbackPath: string = ROUTE_PATHS.root) => {');
    expect(source).not.toContain('targetPath: string');
    expect(source).not.toContain('onNavigate: navigate,');
  });
});
