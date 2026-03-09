import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..');

describe('capacitor baseline workflow', () => {
  it('runs capacitor baseline validation in service standard CI workflow', () => {
    const source = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'service-standard.yml'), 'utf8');

    expect(source).toContain('Validate capacitor baseline');
    expect(source).toContain('pnpm validate:capacitor:baseline');
  });
});
