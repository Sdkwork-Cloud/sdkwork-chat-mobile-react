import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(__dirname, '..');

describe('native permission schema validation', () => {
  it('exports schema validation with zero errors for current baseline', async () => {
    const modulePath = path.join(repoRoot, 'scripts', 'native-permission-schema.mjs');
    const schemaModule = await import(pathToFileURL(modulePath).href);
    const result = schemaModule.validateNativePermissionBaselineSchema();

    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('integrates schema validation into verify-native-permission-baseline script', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'scripts', 'verify-native-permission-baseline.mjs'), 'utf8');

    expect(source).toContain("from './native-permission-schema.mjs'");
    expect(source).toContain('validateNativePermissionBaselineSchema');
  });
});
