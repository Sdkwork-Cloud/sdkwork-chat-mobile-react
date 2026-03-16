import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';

const ROOT_DIR = fileURLToPath(new URL('../../', import.meta.url));
const CORE_ZH_DIR = path.join(ROOT_DIR, 'src', 'core', 'i18n', 'locales', 'zh-CN');
const CORE_EN_DIR = path.join(ROOT_DIR, 'src', 'core', 'i18n', 'locales', 'en-US');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const LATIN1_LETTER_PATTERN = /[\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/u;
const QUESTION_CLUSTER_PATTERN = /\?{6,}/;
const REPLACEMENT_CHAR_PATTERN = /\uFFFD/u;

const toRelativePath = (filePath: string) => path.relative(ROOT_DIR, filePath).split(path.sep).join('/');

const listTsFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listTsFiles(fullPath);
      }
      if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.endsWith('.test.ts')) {
        return [];
      }
      return [fullPath];
    })
  );

  return results.flat().sort((left, right) => left.localeCompare(right));
};

const flattenLeafKeys = (value: unknown, prefix = ''): string[] => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  ) {
    return prefix ? [prefix] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenLeafKeys(item, `${prefix}[${index}]`));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenLeafKeys(child, prefix ? `${prefix}.${key}` : key)
    );
  }

  return [];
};

const importDefaultExport = async (filePath: string) => {
  const module = await import(pathToFileURL(filePath).href);
  return module.default;
};

describe('i18n contracts', () => {
  it('keeps locale source files free from encoding corruption markers', async () => {
    const coreFiles = [...(await listTsFiles(CORE_ZH_DIR)), ...(await listTsFiles(CORE_EN_DIR))];
    const packageEntries = await readdir(PACKAGES_DIR, { withFileTypes: true });
    const packageLocaleFiles = packageEntries.flatMap((entry) => {
      if (!entry.isDirectory()) return [];
      return [
        path.join(PACKAGES_DIR, entry.name, 'src/i18n/zh.ts'),
        path.join(PACKAGES_DIR, entry.name, 'src/i18n/en.ts'),
      ];
    });

    for (const filePath of [...coreFiles, ...packageLocaleFiles]) {
      const content = await readFile(filePath, 'utf8').catch(() => '');
      if (!content) continue;

      expect(content, `${toRelativePath(filePath)} should not contain U+FFFD`).not.toMatch(
        REPLACEMENT_CHAR_PATTERN
      );
      expect(content, `${toRelativePath(filePath)} should not contain long question-mark clusters`).not.toMatch(
        QUESTION_CLUSTER_PATTERN
      );
      expect(content, `${toRelativePath(filePath)} should not contain Latin-1 mojibake letters`).not.toMatch(
        LATIN1_LETTER_PATTERN
      );
    }
  });

  it('keeps core zh-CN and en-US locale module sets aligned', async () => {
    const zhFiles = await listTsFiles(CORE_ZH_DIR);
    const enFiles = await listTsFiles(CORE_EN_DIR);

    expect(zhFiles.map((filePath) => path.relative(CORE_ZH_DIR, filePath))).toEqual(
      enFiles.map((filePath) => path.relative(CORE_EN_DIR, filePath))
    );
  });

  it('keeps core zh-CN and en-US locale keys aligned file-by-file', async () => {
    const zhFiles = await listTsFiles(CORE_ZH_DIR);

    for (const zhFile of zhFiles) {
      const relative = path.relative(CORE_ZH_DIR, zhFile);
      const enFile = path.join(CORE_EN_DIR, relative);
      const zhLocale = await importDefaultExport(zhFile);
      const enLocale = await importDefaultExport(enFile);

      expect(new Set(flattenLeafKeys(zhLocale)), `zh/en mismatch in ${relative}`).toEqual(
        new Set(flattenLeafKeys(enLocale))
      );
    }
  });

  it('keeps package-level zh/en locale keys aligned', async () => {
    const packageEntries = await readdir(PACKAGES_DIR, { withFileTypes: true });

    for (const entry of packageEntries) {
      if (!entry.isDirectory()) continue;
      const zhFile = path.join(PACKAGES_DIR, entry.name, 'src/i18n/zh.ts');
      const enFile = path.join(PACKAGES_DIR, entry.name, 'src/i18n/en.ts');

      const hasZh = await readFile(zhFile, 'utf8').then(() => true).catch(() => false);
      const hasEn = await readFile(enFile, 'utf8').then(() => true).catch(() => false);
      if (!hasZh || !hasEn) continue;

      const zhLocale = await importDefaultExport(zhFile);
      const enLocale = await importDefaultExport(enFile);

      expect(new Set(flattenLeafKeys(zhLocale)), `zh/en mismatch in ${entry.name}`).toEqual(
        new Set(flattenLeafKeys(enLocale))
      );
    }
  });
});
