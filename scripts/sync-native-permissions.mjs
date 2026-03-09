import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const androidManifestPath = path.join(repoRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const iosInfoPlistPath = path.join(repoRoot, 'ios', 'App', 'App', 'Info.plist');

const androidFeatureLines = [
  '<uses-feature android:name="android.hardware.camera.any" android:required="false" />',
  '<uses-feature android:name="android.hardware.microphone" android:required="false" />',
];

const androidPermissionLines = [
  '<uses-permission android:name="android.permission.INTERNET" />',
  '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
  '<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />',
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
  '<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />',
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  '<uses-permission android:name="android.permission.VIBRATE" />',
  '<uses-permission android:name="android.permission.WAKE_LOCK" />',
  '<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />',
  '<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />',
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />',
];

const iosPermissionEntries = [
  ['NSCameraUsageDescription', 'OpenChat needs camera access for video calls, photo upload and QR scanning.'],
  ['NSMicrophoneUsageDescription', 'OpenChat needs microphone access for voice calls, video calls and voice messages.'],
  ['NSPhotoLibraryUsageDescription', 'OpenChat needs photo library access to upload images and videos.'],
  ['NSPhotoLibraryAddUsageDescription', 'OpenChat needs photo library write access to save images and videos.'],
  ['NSContactsUsageDescription', 'OpenChat needs contacts access to match contacts and start calls quickly.'],
  ['NSBluetoothAlwaysUsageDescription', 'OpenChat needs Bluetooth access to connect headsets and audio devices.'],
  ['NSLocalNetworkUsageDescription', 'OpenChat needs local network access for LAN debugging and device discovery.'],
  ['NSFaceIDUsageDescription', 'OpenChat uses Face ID for secure authentication and payment verification.'],
];

const iosBackgroundModes = ['audio', 'voip', 'remote-notification'];

function ensureIosBackgroundModes(source) {
  const backgroundModesPattern = /<key>UIBackgroundModes<\/key>\s*<array>([\s\S]*?)<\/array>/m;
  const match = source.match(backgroundModesPattern);

  if (!match) {
    const block = [
      '\t<key>UIBackgroundModes</key>',
      '\t<array>',
      ...iosBackgroundModes.map((mode) => `\t\t<string>${mode}</string>`),
      '\t</array>',
    ].join('\n');
    return {
      source: source.replace('</dict>', `${block}\n</dict>`),
      additions: iosBackgroundModes.length + 1,
    };
  }

  let block = match[0];
  let additions = 0;
  for (const mode of iosBackgroundModes) {
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

  const missingFeatures = androidFeatureLines.filter((line) => !source.includes(line));
  if (missingFeatures.length) {
    const block = `${missingFeatures.map((line) => `    ${line}`).join('\n')}\n\n    <application`;
    source = source.replace('    <application', block);
    changed = true;
  }

  const missingPermissions = androidPermissionLines.filter((line) => !source.includes(line));
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
  const missingBlocks = iosPermissionEntries
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
