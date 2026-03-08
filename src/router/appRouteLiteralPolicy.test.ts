import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_ROOT = path.join(__dirname, '..');

const RAW_ROUTE_NAVIGATION_PATTERN = /\bnavigate(?:Back)?\(\s*['"]\/[a-z0-9\-/?=&]+['"]/g;
const SOURCE_FILE_PATTERN = /\.(ts|tsx)$/;
const TEST_FILE_PATTERN = /\.test\.(ts|tsx)$/;

const collectSourceFiles = (directoryPath: string): string[] => {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absoluteEntryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(absoluteEntryPath));
      continue;
    }
    if (!SOURCE_FILE_PATTERN.test(entry.name)) continue;
    if (TEST_FILE_PATTERN.test(entry.name)) continue;
    files.push(absoluteEntryPath);
  }

  return files;
};

describe('app route literal policy', () => {
  it('keeps src navigation calls on ROUTE_PATHS constants', () => {
    const sourceFiles = collectSourceFiles(SRC_ROOT);
    const offenders = sourceFiles.flatMap((absoluteFilePath) => {
      const source = fs.readFileSync(absoluteFilePath, 'utf8');
      const matches = source.match(RAW_ROUTE_NAVIGATION_PATTERN) ?? [];
      const relativeFilePath = path.relative(SRC_ROOT, absoluteFilePath).replace(/\\/g, '/');
      return matches.map((match) => `${relativeFilePath}: ${match}`);
    });

    expect(offenders).toEqual([]);
  });
});
