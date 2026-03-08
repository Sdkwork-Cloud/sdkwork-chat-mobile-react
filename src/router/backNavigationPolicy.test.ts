import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('router back navigation policy', () => {
  it('uses app-managed route history index instead of raw browser history length', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("const ROUTER_HISTORY_INDEX_KEY = '__sdkwork_route_index';");
    expect(source).toContain('const readHistoryIndex = (state: unknown): number | null => {');
    expect(source).toContain('const currentHistoryIndex = readHistoryIndex(window.history.state);');
    expect(source).toContain('if (currentHistoryIndex !== null && currentHistoryIndex > 0) {');
    expect(source).toContain('window.history.back();');
    expect(source).toContain('navigate(fallbackPath);');

    expect(source).not.toContain('if (window.history.length > 1) {');
  });
});
