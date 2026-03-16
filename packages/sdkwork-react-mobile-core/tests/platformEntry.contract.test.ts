import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('platform entry contracts', () => {
  it('keeps platform implementations lazy-loaded without static re-exports', async () => {
    const source = await readFile(new URL('../src/platform/index.ts', import.meta.url), 'utf8');

    expect(source).toContain("await import('./capacitor')");
    expect(source).toContain("await import('./web')");
    expect(source).not.toContain("export { WebPlatform } from './web';");
    expect(source).not.toContain("export { CapacitorPlatform } from './capacitor';");
  });
});
