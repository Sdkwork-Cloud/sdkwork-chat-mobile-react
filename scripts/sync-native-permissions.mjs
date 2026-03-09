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

const androidManifestPath = path.join(repoRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const iosInfoPlistPath = path.join(repoRoot, 'ios', 'App', 'App', 'Info.plist');

function ensureIosBackgroundModes(source) {
  const backgroundModesPattern = /<key>UIBackgroundModes<\/key>\s*<array>([\s\S]*?)<\/array>/m;
  const match = source.match(backgroundModesPattern);

  if (!match) {
    const block = [
      '\t<key>UIBackgroundModes</key>',
      '\t<array>',
      ...IOS_BACKGROUND_MODES.map((mode) => `\t\t<string>${mode}</string>`),
      '\t</array>',
    ].join('\n');
    return {
      source: source.replace('</dict>', `${block}\n</dict>`),
      additions: IOS_BACKGROUND_MODES.length + 1,
    };
  }

  let block = match[0];
  let additions = 0;
  for (const mode of IOS_BACKGROUND_MODES) {
    const marker = `<string>${mode}</string>`;
    if (!block.includes(marker)) {
      block = block.replace('</array>', `\t\t${marker}\n\t</array>`);
      additions += 1;
    }
  }

  if (!additions) {
    return {
      source,
      additions: 0,
    };
  }

  return {
    source: source.replace(backgroundModesPattern, block),
    additions,
  };
}

function syncAndroidManifest() {
  if (!fs.existsSync(androidManifestPath)) {
    console.log('[permissions] Android manifest not found, skip android sync');
    return;
  }

  let source = fs.readFileSync(androidManifestPath, 'utf8');
  let changed = false;

  const missingFeatures = ANDROID_FEATURE_LINES.filter((line) => !source.includes(line));
  if (missingFeatures.length) {
    const block = `${missingFeatures.map((line) => `    ${line}`).join('\n')}\n\n    <application`;
    source = source.replace('    <application', block);
    changed = true;
  }

  const missingPermissions = ANDROID_PERMISSION_LINES.filter((line) => !source.includes(line));
  if (missingPermissions.length) {
    const block = `${missingPermissions.map((line) => `    ${line}`).join('\n')}\n</manifest>`;
    source = source.replace('</manifest>', block);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(androidManifestPath, source, 'utf8');
    console.log(`[permissions] Android manifest synced with ${missingFeatures.length + missingPermissions.length} additions`);
    return;
  }

  console.log('[permissions] Android manifest already aligned');
}

function syncIosInfoPlist() {
  if (!fs.existsSync(iosInfoPlistPath)) {
    console.log('[permissions] iOS Info.plist not found, skip iOS sync');
    return;
  }

  let source = fs.readFileSync(iosInfoPlistPath, 'utf8');
  let changed = false;
  const missingBlocks = IOS_PERMISSION_ENTRIES
    .filter(([key]) => !source.includes(`<key>${key}</key>`))
    .map(
      ([key, value]) => `\t<key>${key}</key>\n\t<string>${value}</string>`,
    );

  if (missingBlocks.length) {
    source = source.replace('</dict>', `${missingBlocks.join('\n')}\n</dict>`);
    changed = true;
  }

  const backgroundModeResult = ensureIosBackgroundModes(source);
  if (backgroundModeResult.additions > 0) {
    source = backgroundModeResult.source;
    changed = true;
  }

  if (!changed) {
    console.log('[permissions] iOS Info.plist already aligned');
    return;
  }

  fs.writeFileSync(iosInfoPlistPath, source, 'utf8');
  console.log(
    `[permissions] iOS Info.plist synced with ${
      missingBlocks.length + backgroundModeResult.additions
    } additions`,
  );
}

syncAndroidManifest();
syncIosInfoPlist();
