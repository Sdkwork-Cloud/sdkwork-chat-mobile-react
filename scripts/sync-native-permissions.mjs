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
  '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />',
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />',
];

const iosPermissionEntries = [
  ['NSCameraUsageDescription', 'OpenChat 需要相机权限用于视频通话、拍照上传与二维码扫描。'],
  ['NSMicrophoneUsageDescription', 'OpenChat 需要麦克风权限用于语音通话、视频通话与语音消息。'],
  ['NSPhotoLibraryUsageDescription', 'OpenChat 需要访问相册用于上传图片和视频。'],
  ['NSPhotoLibraryAddUsageDescription', 'OpenChat 需要写入相册用于保存图片和视频。'],
  ['NSContactsUsageDescription', 'OpenChat 需要通讯录权限用于匹配联系人与快速发起通话。'],
  ['NSBluetoothAlwaysUsageDescription', 'OpenChat 需要蓝牙权限用于连接蓝牙耳机与音频设备。'],
  ['NSLocalNetworkUsageDescription', 'OpenChat 需要本地网络权限用于局域网调试与设备发现。'],
  ['NSFaceIDUsageDescription', 'OpenChat 使用 Face ID 进行安全认证和支付校验。'],
];

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
  const missingBlocks = iosPermissionEntries
    .filter(([key]) => !source.includes(`<key>${key}</key>`))
    .map(
      ([key, value]) => `\t<key>${key}</key>\n\t<string>${value}</string>`,
    );

  if (!missingBlocks.length) {
    console.log('[permissions] iOS Info.plist already aligned');
    return;
  }

  source = source.replace('</dict>', `${missingBlocks.join('\n')}\n</dict>`);
  fs.writeFileSync(iosInfoPlistPath, source, 'utf8');
  console.log(`[permissions] iOS Info.plist synced with ${missingBlocks.length} additions`);
}

syncAndroidManifest();
syncIosInfoPlist();
