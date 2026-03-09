import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ANDROID_FEATURE_LINES,
  ANDROID_PERMISSION_LINES,
  IOS_BACKGROUND_MODES,
  IOS_PERMISSION_ENTRIES,
} from './native-permission-baseline.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const androidTemplatePath = path.join(repoRoot, 'config', 'android', 'AndroidManifest.permissions.template.xml');
const iosTemplatePath = path.join(repoRoot, 'config', 'ios', 'Info.plist.permissions.template.xml');
const syncScriptPath = path.join(repoRoot, 'scripts', 'sync-native-permissions.mjs');
const auditScriptPath = path.join(repoRoot, 'scripts', 'audit-capacitor-capabilities.mjs');

function read(pathname) {
  return fs.readFileSync(pathname, 'utf8');
}

function missingEntries(source, entries) {
  return entries.filter((entry) => !source.includes(entry));
}

function printMissing(title, entries) {
  if (!entries.length) {
    console.log(`[verify-permissions] ${title}: ok`);
    return false;
  }

  console.error(`[verify-permissions] ${title}: missing ${entries.length} item(s)`);
  for (const entry of entries) {
    console.error(`  - ${entry}`);
  }
  return true;
}

const androidTemplate = read(androidTemplatePath);
const iosTemplate = read(iosTemplatePath);
const syncScript = read(syncScriptPath);
const auditScript = read(auditScriptPath);

const iosPermissionBlocks = IOS_PERMISSION_ENTRIES.flatMap(([key, value]) => [
  `<key>${key}</key>`,
  `<string>${value}</string>`,
]);
const iosBackgroundBlocks = [
  '<key>UIBackgroundModes</key>',
  ...IOS_BACKGROUND_MODES.map((mode) => `<string>${mode}</string>`),
];

let hasFailure = false;

hasFailure = printMissing('android template features', missingEntries(androidTemplate, ANDROID_FEATURE_LINES)) || hasFailure;
hasFailure = printMissing('android template permissions', missingEntries(androidTemplate, ANDROID_PERMISSION_LINES)) || hasFailure;
hasFailure = printMissing('ios template permission entries', missingEntries(iosTemplate, iosPermissionBlocks)) || hasFailure;
hasFailure = printMissing('ios template background modes', missingEntries(iosTemplate, iosBackgroundBlocks)) || hasFailure;
hasFailure =
  printMissing('sync script shared baseline import', missingEntries(syncScript, ["from './native-permission-baseline.mjs'"]))
  || hasFailure;
hasFailure =
  printMissing('audit script shared baseline import', missingEntries(auditScript, ["from './native-permission-baseline.mjs'"]))
  || hasFailure;

if (hasFailure) {
  process.exit(1);
}

console.log('[verify-permissions] native permission baseline is aligned.');
