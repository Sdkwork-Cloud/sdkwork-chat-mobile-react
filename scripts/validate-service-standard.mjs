#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = ['packages', 'src', 'docs'];
const TEXT_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.css',
]);
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.turbo',
  'coverage',
  '.pnpm-store',
]);

const errors = [];
const warnings = [];

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function toLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

function walkFiles(startPath, result) {
  if (!fs.existsSync(startPath)) return;

  const entries = fs.readdirSync(startPath, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, result);
      continue;
    }
    if (!entry.isFile()) continue;
    if (TEXT_EXT.has(path.extname(entry.name))) {
      result.push(fullPath);
    }
  }
}

function addIssue(list, file, line, message) {
  list.push({
    file: normalizePath(path.relative(ROOT, file)),
    line,
    message,
  });
}

function findMatchingBrace(content, openBraceIndex) {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openBraceIndex; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inSingleQuote) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === '\'') inSingleQuote = false;
      continue;
    }

    if (inDoubleQuote) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === '"') inDoubleQuote = false;
      continue;
    }

    if (inTemplateString) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === '`') inTemplateString = false;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (ch === '\'') {
      inSingleQuote = true;
      continue;
    }

    if (ch === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (ch === '`') {
      inTemplateString = true;
      continue;
    }

    if (ch === '{') {
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function isServiceLayer(file) {
  const f = normalizePath(path.relative(ROOT, file));
  return /(^|\/)src\/services\//.test(f);
}

function isPackageServiceLayer(file) {
  const rel = normalizePath(path.relative(ROOT, file));
  return /^packages\/[^/]+\/src\/services\//.test(rel);
}

function isRootServiceLayer(file) {
  const rel = normalizePath(path.relative(ROOT, file));
  return /^src\/services\//.test(rel);
}

function isCodeFile(file) {
  const ext = path.extname(file);
  return ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx' || ext === '.mjs' || ext === '.cjs';
}

function isStorageAllowed(file) {
  const rel = normalizePath(path.relative(ROOT, file));
  return (
    isServiceLayer(file) ||
    rel === 'src/platform-impl/web/index.ts' ||
    rel === 'packages/sdkwork-react-mobile-core/src/platform/web.ts' ||
    rel === 'packages/sdkwork-react-mobile-core/src/storage/persistStorage.ts'
  );
}

function isNetworkAllowed(file) {
  const rel = normalizePath(path.relative(ROOT, file));
  return (
    isServiceLayer(file) ||
    rel === 'src/core/net.ts' ||
    rel === 'packages/sdkwork-react-mobile-core/src/platform/web.ts'
  );
}

function isEventBusCoreInfra(file) {
  const rel = normalizePath(path.relative(ROOT, file));
  return (
    rel.includes('/src/services/') ||
    rel === 'packages/sdkwork-react-mobile-core/src/events/index.ts' ||
    rel === 'packages/sdkwork-react-mobile-core/src/storage/AbstractStorageService.ts' ||
    rel === 'packages/sdkwork-react-mobile-core/src/factory/runtimeDeps.ts' ||
    rel === 'src/core/events.ts' ||
    rel === 'src/core/AbstractStorageService.ts'
  );
}

function isUiInteractionLayer(file) {
  const rel = normalizePath(path.relative(ROOT, file));
  return /(^|\/)src\/(pages|hooks|stores)\//.test(rel);
}

const files = [];
for (const root of SCAN_ROOTS) {
  walkFiles(path.join(ROOT, root), files);
}

for (const file of files) {
  const rel = normalizePath(path.relative(ROOT, file));
  const content = fs.readFileSync(file, 'utf8');
  const codeFile = isCodeFile(file);

  // 1) Service file naming + factory interface checks
  if (codeFile && /(^|\/)src\/services\/[^/]+\.ts$/.test(rel)) {
    const base = path.basename(rel);
    const shouldEnforceServiceNaming =
      base.endsWith('Service.ts') || /export function create[A-Za-z0-9]+Service\(/.test(content);
    if (
      shouldEnforceServiceNaming &&
      base !== 'index.ts' &&
      !base.endsWith('.test.ts') &&
      !base.endsWith('.spec.ts') &&
      !/^[A-Z][A-Za-z0-9]*\.ts$/.test(base)
    ) {
      addIssue(errors, file, 1, `Service file must use PascalCase: ${base}`);
    }

    const factoryMatches = [...content.matchAll(/export function create[A-Za-z0-9]+Service\(([^)]*)\):/g)];
    if (factoryMatches.length > 0) {
      const hasDepsImport = /import\s+type\s*{[^}]*\bServiceFactoryDeps\b[^}]*}\s*from\s*'@sdkwork\/react-mobile-core';/.test(
        content,
      );
      if (!hasDepsImport) {
        addIssue(errors, file, 1, 'Factory file must import `ServiceFactoryDeps` from @sdkwork/react-mobile-core');
      }

      for (const match of factoryMatches) {
        const paramText = (match[1] || '').trim();
        const line = toLineNumber(content, match.index || 0);
        if (paramText !== '_deps?: ServiceFactoryDeps') {
          addIssue(
            errors,
            file,
            line,
            `Factory signature must be \`(_deps?: ServiceFactoryDeps)\`, got \`${paramText || '(empty)'}\``,
          );
        }

        const openBraceIndex = content.indexOf('{', match.index || 0);
        if (openBraceIndex === -1) {
          addIssue(errors, file, line, 'Factory function body is missing');
          continue;
        }

        const closeBraceIndex = findMatchingBrace(content, openBraceIndex);
        if (closeBraceIndex === -1) {
          addIssue(errors, file, line, 'Factory function body braces are unbalanced');
          continue;
        }

        const factoryBody = content.slice(openBraceIndex + 1, closeBraceIndex);
        if (!/\b_deps\b/.test(factoryBody)) {
          addIssue(
            errors,
            file,
            line,
            'Factory `_deps` must be forwarded to implementation or runtime dependency resolver',
          );
        }
      }

      const singletonMatches = [
        ...content.matchAll(
          /export const ([A-Za-z0-9_]+Service)\s*(?::\s*([^=;]+))?\s*=\s*create[A-Za-z0-9]+Service\(\s*\)\s*;/g,
        ),
      ];
      for (const singleton of singletonMatches) {
        const singletonName = singleton[1];
        const singletonType = (singleton[2] || '').trim();
        const line = toLineNumber(content, singleton.index || 0);
        if (!singletonType) {
          addIssue(
            errors,
            file,
            line,
            `Service singleton \`${singletonName}\` must use explicit interface type annotation`,
          );
          continue;
        }
        if (!/\bI[A-Za-z0-9_]+Service\b/.test(singletonType)) {
          addIssue(
            errors,
            file,
            line,
            `Service singleton \`${singletonName}\` type should be an \`I*Service\` interface, got \`${singletonType}\``,
          );
        }
      }
    }
  }
  // 2) Mojibake / replacement character check (service-focused, low-noise)
  if (isServiceLayer(file)) {
    const mojibakePattern = /\uFFFD/g;
    let mojibakeMatch;
    while ((mojibakeMatch = mojibakePattern.exec(content)) !== null) {
      addIssue(errors, file, toLineNumber(content, mojibakeMatch.index), 'Detected replacement character (possible encoding corruption)');
    }
  }
  // 3) Storage boundary check
  const storagePattern = /\b(localStorage|sessionStorage)\b/g;
  if (codeFile && !isStorageAllowed(file)) {
    let storageMatch;
    while ((storageMatch = storagePattern.exec(content)) !== null) {
      addIssue(
        errors,
        file,
        toLineNumber(content, storageMatch.index),
        `Direct ${storageMatch[1]} access is not allowed outside service/core platform boundary`,
      );
    }
  }

  // 4) Network boundary check
  const networkPattern = /\bfetch\s*\(|axios\.|request\s*\(|http\.(get|post|put|delete)\s*\(/g;
  if (codeFile && !isNetworkAllowed(file)) {
    let networkMatch;
    while ((networkMatch = networkPattern.exec(content)) !== null) {
      addIssue(
        errors,
        file,
        toLineNumber(content, networkMatch.index),
        `Direct network call (${networkMatch[0].trim()}) is not allowed outside service/core net boundary`,
      );
    }
  }

  // 5) Service event literal check
  const serviceEventLiteralPattern = /\beventBus\.(on|emit)\(\s*['"`]/g;
  if (codeFile && isServiceLayer(file)) {
    let eventLiteralMatch;
    while ((eventLiteralMatch = serviceEventLiteralPattern.exec(content)) !== null) {
      addIssue(
        errors,
        file,
        toLineNumber(content, eventLiteralMatch.index),
        'Service event name must use module-level constants, string literal is forbidden',
      );
    }
  }

  // 6) Event bus direct usage boundary check
  const eventBusPattern = /\beventBus\./g;
  if (codeFile) {
    if (isUiInteractionLayer(file)) {
      let eventBusMatch;
      while ((eventBusMatch = eventBusPattern.exec(content)) !== null) {
        addIssue(
          errors,
          file,
          toLineNumber(content, eventBusMatch.index),
          'Direct eventBus usage is forbidden in pages/hooks/stores, use service event facade instead',
        );
      }
    } else if (!isEventBusCoreInfra(file)) {
      let eventBusMatch;
      while ((eventBusMatch = eventBusPattern.exec(content)) !== null) {
        addIssue(
          warnings,
          file,
          toLineNumber(content, eventBusMatch.index),
          'Direct eventBus usage outside service layer (consider event facade or service method)',
        );
      }
    }
  }

  // 7) Service runtime direct-call check
  const serviceRuntimeDirectPattern = /\b(Date\.now\s*\(|crypto\.randomUUID\s*\(|getPlatform\s*\()/g;
  if (codeFile && isServiceLayer(file)) {
    let runtimeDirectMatch;
    while ((runtimeDirectMatch = serviceRuntimeDirectPattern.exec(content)) !== null) {
      addIssue(
        errors,
        file,
        toLineNumber(content, runtimeDirectMatch.index),
        `Service must not call runtime API directly (${runtimeDirectMatch[0].trim()}), use injected deps`,
      );
    }
  }

  // 8) Package service architecture guard
  if (codeFile && isPackageServiceLayer(file)) {
    const ext = path.extname(file);
    const base = path.basename(rel);
    const isServiceTest = base.endsWith('.test.ts') || base.endsWith('.spec.ts') || base.endsWith('.test.tsx') || base.endsWith('.spec.tsx');
    const isAllowedServiceTs =
      base === 'index.ts' ||
      base === 'types.ts' ||
      base === 'schema.ts' ||
      base.endsWith('Service.ts') ||
      isServiceTest;

    if ((ext === '.ts' || ext === '.js' || ext === '.mjs' || ext === '.cjs') && !isAllowedServiceTs) {
      addIssue(
        errors,
        file,
        1,
        'Package service directory must contain only `*Service.ts`, `index.ts`, `types.ts`, `schema.ts`, or test files',
      );
    }

    if (ext === '.tsx' && !isServiceTest) {
      addIssue(
        errors,
        file,
        1,
        'Package service directory must not contain TSX runtime files; move UI state to stores/hooks',
      );
    }

    const singletonImportPattern =
      /import\s*{[^}]*\b(eventBus|logger|platformService|getPlatform)\b[^}]*}\s*from\s*'@sdkwork\/react-mobile-core';/g;
    let singletonImportMatch;
    while ((singletonImportMatch = singletonImportPattern.exec(content)) !== null) {
      addIssue(
        errors,
        file,
        toLineNumber(content, singletonImportMatch.index),
        `Package service must use runtime deps injection; direct core singleton import is forbidden (${singletonImportMatch[1]})`,
      );
    }
  }

  // 9) Root service migration hints (phase mode)
  if (codeFile && isRootServiceLayer(file)) {
    const base = path.basename(rel);
    const ext = path.extname(file);
    const isAllowedServiceFile =
      base === 'index.ts' ||
      base === 'AppUiStateService.ts' ||
      base.endsWith('.test.ts') ||
      base.endsWith('.spec.ts');

    if (!isAllowedServiceFile && !base.endsWith('Service.ts')) {
      addIssue(
        warnings,
        file,
        1,
        'Root src/services is in phase-migration: non-service file should be moved to theme/stores/navigation/llm modules',
      );
    }

    if (ext === '.tsx') {
      addIssue(
        warnings,
        file,
        1,
        'Root src/services TSX file should be migrated out in phase mode (target: src/stores or src/theme)',
      );
    }
  }
}

const uniqueIssues = (list) => {
  const seen = new Set();
  return list.filter((item) => {
    const key = `${item.file}:${item.line}:${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const uniqueErrors = uniqueIssues(errors);
const uniqueWarnings = uniqueIssues(warnings);

const printIssues = (label, list) => {
  if (list.length === 0) return;
  console.log(`\n${label} (${list.length})`);
  for (const item of list) {
    console.log(`- ${item.file}:${item.line} ${item.message}`);
  }
};

console.log('[service-standard] Validation Summary');
console.log(`- Scanned files: ${files.length}`);
console.log(`- Errors: ${uniqueErrors.length}`);
console.log(`- Warnings: ${uniqueWarnings.length}`);

printIssues('Errors', uniqueErrors);
printIssues('Warnings', uniqueWarnings);

if (uniqueErrors.length > 0) {
  process.exit(1);
}
