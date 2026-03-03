#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = ['packages', 'src', 'docs', 'scripts'];
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
  '.yml',
  '.yaml',
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

const issues = [];
const strictMode = process.argv.includes('--strict') || process.env.ENCODING_STRICT === '1';
const QUESTION_CLUSTER_MIN = 6;

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

function addIssue(file, line, message) {
  issues.push({
    file: normalizePath(path.relative(ROOT, file)),
    line,
    message,
  });
}

const files = [];
for (const root of SCAN_ROOTS) {
  walkFiles(path.join(ROOT, root), files);
}

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Low-noise rule #1: replacement character is always suspicious.
  const replacementCharPattern = /\uFFFD/g;
  let match;
  while ((match = replacementCharPattern.exec(content)) !== null) {
    addIssue(file, toLineNumber(content, match.index), 'Found replacement character (U+FFFD), possible encoding corruption');
  }

  // Low-noise rule #2: long `?` clusters usually indicate text degradation (e.g. mojibake fallback).
  const questionClusterPattern = new RegExp(`\\?{${QUESTION_CLUSTER_MIN},}`, 'g');
  while ((match = questionClusterPattern.exec(content)) !== null) {
    addIssue(
      file,
      toLineNumber(content, match.index),
      `Found suspicious question-mark cluster (${QUESTION_CLUSTER_MIN}+ contiguous '?'), possible text degradation`,
    );
  }
}

console.log('[encoding] Validation Summary');
console.log(`- Scanned files: ${files.length}`);
const uniqueIssues = (() => {
  const seen = new Set();
  return issues.filter((item) => {
    const key = `${item.file}:${item.line}:${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();
const replacementCount = uniqueIssues.filter((item) => item.message.includes('U+FFFD')).length;
const questionClusterCount = uniqueIssues.filter((item) => item.message.includes('question-mark cluster')).length;
console.log(`- Strict mode: ${strictMode ? 'on' : 'off'}`);
console.log(`- Findings: ${uniqueIssues.length}`);
console.log(`- Replacement-char findings: ${replacementCount}`);
console.log(`- Question-cluster findings: ${questionClusterCount}`);

if (uniqueIssues.length > 0) {
  const label = strictMode ? 'Errors' : 'Warnings';
  console.log(`\n${label} (${uniqueIssues.length})`);
  for (const item of uniqueIssues) {
    console.log(`- ${item.file}:${item.line} ${item.message}`);
  }
  if (strictMode) {
    process.exit(1);
  }
}
