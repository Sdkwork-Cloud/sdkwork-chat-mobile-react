import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(__dirname, '..');

describe('native permission baseline source of truth', () => {
  it('centralizes baseline constants in a single module', async () => {
    const modulePath = path.join(repoRoot, 'scripts', 'native-permission-baseline.mjs');
    const baseline = await import(pathToFileURL(modulePath).href);

    expect(Array.isArray(baseline.ANDROID_PERMISSION_LINES)).toBe(true);
    expect(Array.isArray(baseline.IOS_PERMISSION_ENTRIES)).toBe(true);
    expect(Array.isArray(baseline.IOS_BACKGROUND_MODES)).toBe(true);
    expect(baseline.ANDROID_PERMISSION_LINES).toContain(
      '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_PHONE_CALL" />',
    );
    expect(baseline.ANDROID_PERMISSION_LINES).toContain(
      '<uses-permission android:name="android.permission.READ_CONTACTS" />',
    );
    expect(baseline.ANDROID_COMMON_PERMISSION_BASELINE).toContain('android.permission.READ_CONTACTS');
    expect(baseline.IOS_BACKGROUND_MODES).toContain('voip');
    expect(
      baseline.IOS_PERMISSION_ENTRIES.some(([key]: [string, string]) => key === 'NSBluetoothPeripheralUsageDescription'),
    ).toBe(true);
  });

  it('keeps sync script and audit script wired to the shared baseline module', () => {
    const syncScript = fs.readFileSync(path.join(repoRoot, 'scripts', 'sync-native-permissions.mjs'), 'utf8');
    const auditScript = fs.readFileSync(path.join(repoRoot, 'scripts', 'audit-capacitor-capabilities.mjs'), 'utf8');

    expect(syncScript).toContain("from './native-permission-baseline.mjs'");
    expect(auditScript).toContain("from './native-permission-baseline.mjs'");
  });
});
