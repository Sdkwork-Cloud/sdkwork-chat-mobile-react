import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('vite manual chunk contracts', () => {
  it('routes Vite preload helpers into a dedicated runtime chunk', async () => {
    const source = await readFile(new URL('../../vite.config.ts', import.meta.url), 'utf8');

    expect(source).toContain("normalized.includes('vite/preload-helper')");
    expect(source).toContain("normalized.includes('vite/modulepreload-polyfill')");
    expect(source).toContain("return 'app-runtime';");
  });
});
