import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('tools package join-group migration guard', () => {
  it('keeps join-group capability out of tools package exports', () => {
    const pagesIndex = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');
    const packageIndex = fs.readFileSync(path.join(__dirname, '..', 'index.ts'), 'utf8');

    expect(pagesIndex).not.toContain('JoinGroupPage');
    expect(packageIndex).not.toContain('JoinGroupPage');
    expect(packageIndex).toContain("export { ScanPage } from './pages';");
  });
});

