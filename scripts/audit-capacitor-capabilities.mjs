import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function readJson(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function readText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return fs.readFileSync(absolutePath, 'utf8');
}

function readTextIfExists(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return '';
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function hasDependency(manifest, dependencyName) {
  return Boolean(
    manifest.dependencies?.[dependencyName] ||
      manifest.devDependencies?.[dependencyName] ||
      manifest.peerDependencies?.[dependencyName],
  );
}

function toStatusLabel(value) {
  if (value === 'ready') return 'READY';
  if (value === 'partial') return 'PARTIAL';
  return 'MISSING';
}

const rootPackage = readJson('package.json');
const corePackage = readJson('packages/sdkwork-react-mobile-core/package.json');
const userPackage = readJson('packages/sdkwork-react-mobile-user/package.json');
const workspaceYaml = readText('pnpm-workspace.yaml');
const coreCapacitorSource = readText('packages/sdkwork-react-mobile-core/src/platform/capacitor.ts');
const coreRuntimeSource = readText('packages/sdkwork-react-mobile-core/src/platform/runtime.ts');
const userBridgeIndexSource = readText('packages/sdkwork-react-mobile-user/src/bridge/index.ts');
const userBridgeTypesSource = readText('packages/sdkwork-react-mobile-user/src/bridge/types.ts');
const userBridgeGeolocationSource = readTextIfExists(
  'packages/sdkwork-react-mobile-user/src/bridge/native/geolocation.ts',
);
const userBridgeGeolocationHookSource = readTextIfExists(
  'packages/sdkwork-react-mobile-user/src/bridge/hooks/useGeolocation.ts',
);
const coreTypesSource = readText('packages/sdkwork-react-mobile-core/src/platform/types.ts');
const capacitorConfigSource = readText('capacitor.config.ts');
const androidManifestSource = readTextIfExists('android/app/src/main/AndroidManifest.xml');
const androidPermissionTemplateSource = readTextIfExists('config/android/AndroidManifest.permissions.template.xml');
const iosInfoPlistSource = readTextIfExists('ios/App/App/Info.plist');
const iosPermissionTemplateSource = readTextIfExists('config/ios/Info.plist.permissions.template.xml');
const workspaceManifests = [rootPackage, corePackage, userPackage];

function containsAll(source, segments) {
  return segments.every((segment) => source.includes(segment));
}

const androidCallPermissionBaseline = [
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_CAMERA',
  'android.permission.FOREGROUND_SERVICE_MICROPHONE',
  'android.permission.BLUETOOTH_CONNECT',
];

const androidCommonPermissionBaseline = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.ACCESS_WIFI_STATE',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
];

const iosCallPermissionBaseline = [
  'NSCameraUsageDescription',
  'NSMicrophoneUsageDescription',
];

const iosCommonPermissionBaseline = [
  'NSPhotoLibraryUsageDescription',
  'NSPhotoLibraryAddUsageDescription',
  'NSContactsUsageDescription',
  'NSBluetoothAlwaysUsageDescription',
  'NSLocalNetworkUsageDescription',
];

const androidPermissionSource = androidManifestSource || androidPermissionTemplateSource;
const iosPermissionSource = iosInfoPlistSource || iosPermissionTemplateSource;
const hasAndroidCallPermissionBaseline = containsAll(androidPermissionSource, androidCallPermissionBaseline);
const hasAndroidCommonPermissionBaseline = containsAll(androidPermissionSource, androidCommonPermissionBaseline);
const hasIosCallPermissionBaseline = containsAll(iosPermissionSource, iosCallPermissionBaseline);
const hasIosCommonPermissionBaseline = containsAll(iosPermissionSource, iosCommonPermissionBaseline);

const capabilityChecks = [
  {
    id: 'push_notifications',
    tier: 'P0',
    capability: 'Push Notifications',
    plugins: ['@capacitor/push-notifications'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capacitor/push-notifications'"),
      coreCapacitorSource.includes('class CapacitorPush'),
      coreRuntimeSource.includes('PUSH_TOKEN_UPDATED'),
    ],
    installHint: 'pnpm add @capacitor/push-notifications',
  },
  {
    id: 'local_notifications',
    tier: 'P0',
    capability: 'Local Notifications',
    plugins: ['@capacitor/local-notifications'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capacitor/local-notifications'"),
      coreCapacitorSource.includes('class CapacitorNotifications'),
      capacitorConfigSource.includes('LocalNotifications'),
    ],
    installHint: 'pnpm add @capacitor/local-notifications',
  },
  {
    id: 'payment_launch',
    tier: 'P0',
    capability: 'Payment Launch Bridge',
    plugins: ['@capacitor/app-launcher'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capacitor/app-launcher'"),
      coreCapacitorSource.includes('class CapacitorPayment'),
      coreRuntimeSource.includes('parsePaymentCallbackUrl'),
      coreTypesSource.includes('PaymentLaunchRequest'),
    ],
    installHint: 'pnpm add @capacitor/app-launcher',
  },
  {
    id: 'deep_link_callback',
    tier: 'P0',
    capability: 'Deep Link Callback (appUrlOpen)',
    plugins: ['@capacitor/app'],
    integrationChecks: [
      coreCapacitorSource.includes("'appUrlOpen'"),
      coreRuntimeSource.includes('PAYMENT_CALLBACK'),
      coreTypesSource.includes("AppListenerEvent = 'appStateChange' | 'appUrlOpen'"),
    ],
    installHint: 'pnpm add @capacitor/app',
  },
  {
    id: 'network_status',
    tier: 'P0',
    capability: 'Network Status Bridge',
    plugins: ['@capacitor/network'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capacitor/network'"),
      coreCapacitorSource.includes('class CapacitorNetwork'),
      coreRuntimeSource.includes('NETWORK_ONLINE'),
      coreRuntimeSource.includes('platform.network.addListener'),
    ],
    installHint: 'pnpm add @capacitor/network',
  },
  {
    id: 'app_lifecycle',
    tier: 'P0',
    capability: 'App Lifecycle Bridge',
    plugins: ['@capacitor/app'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capacitor/app'"),
      coreCapacitorSource.includes('class CapacitorApp'),
      coreRuntimeSource.includes('APP_FOREGROUND'),
      coreTypesSource.includes("AppListenerEvent = 'appStateChange' | 'appUrlOpen'"),
    ],
    installHint: 'pnpm add @capacitor/app',
  },
  {
    id: 'call_media_permissions',
    tier: 'P0',
    capability: 'Call Media Permissions Baseline',
    plugins: ['@capacitor/camera'],
    integrationChecks: [
      hasAndroidCallPermissionBaseline,
      hasIosCallPermissionBaseline,
      coreCapacitorSource.includes("from '@capacitor/camera'"),
      coreCapacitorSource.includes('class CapacitorCamera'),
    ],
    installHint:
      'Declare camera/microphone call permissions in AndroidManifest and iOS Info.plist (or config template).',
  },
  {
    id: 'geolocation',
    tier: 'P1',
    capability: 'Geolocation',
    plugins: ['@capacitor/geolocation'],
    integrationChecks: [
      userBridgeGeolocationSource.includes("from '@capacitor/geolocation'"),
      userBridgeGeolocationSource.includes('class GeolocationBridge'),
      userBridgeGeolocationHookSource.includes("from '../native/geolocation'"),
      userBridgeIndexSource.includes("from './native/geolocation'"),
      userBridgeIndexSource.includes('useGeolocation'),
      userBridgeTypesSource.includes('GeolocationResult'),
    ],
    installHint: 'pnpm add @capacitor/geolocation',
  },
  {
    id: 'browser_oauth',
    tier: 'P1',
    capability: 'In-App Browser (OAuth/Payment Web Fallback)',
    plugins: ['@capacitor/browser'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capacitor/browser'"),
      coreCapacitorSource.includes('Browser.open'),
      coreCapacitorSource.includes('/^https?:\\/\\//i.test(paymentUrl)'),
    ],
    installHint: 'pnpm add @capacitor/browser',
  },
  {
    id: 'file_picker',
    tier: 'P1',
    capability: 'File Picker',
    plugins: ['@capawesome/capacitor-file-picker'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capawesome/capacitor-file-picker'") ||
        coreCapacitorSource.includes("import('@capawesome/capacitor-file-picker')"),
      coreCapacitorSource.includes('showOpenDialog(options: OpenDialogOptions)'),
      coreCapacitorSource.includes('.pickFiles('),
    ],
    installHint: 'pnpm add @capawesome/capacitor-file-picker',
  },
  {
    id: 'barcode_scan',
    tier: 'P1',
    capability: 'Barcode/QR Scanner',
    plugins: ['@capacitor-mlkit/barcode-scanning'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capacitor-mlkit/barcode-scanning'") ||
        coreCapacitorSource.includes("import('@capacitor-mlkit/barcode-scanning')"),
      coreCapacitorSource.includes('scanQRCode'),
      coreCapacitorSource.includes('BarcodeScanner.scan'),
    ],
    installHint: 'pnpm add @capacitor-mlkit/barcode-scanning',
  },
  {
    id: 'common_mobile_permissions',
    tier: 'P1',
    capability: 'Common Mobile Permission Baseline',
    plugins: ['@capacitor/camera', '@capacitor/local-notifications'],
    integrationChecks: [
      hasAndroidCommonPermissionBaseline,
      hasIosCommonPermissionBaseline,
      capacitorConfigSource.includes('PushNotifications'),
      capacitorConfigSource.includes('LocalNotifications'),
    ],
    installHint:
      'Maintain common permission declarations in AndroidManifest and iOS Info.plist template.',
  },
  {
    id: 'secure_storage',
    tier: 'P2',
    capability: 'Secure Storage (Token/Secrets)',
    plugins: ['@aparajita/capacitor-secure-storage'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@aparajita/capacitor-secure-storage'"),
      coreCapacitorSource.includes('SecureStorage.setItem'),
      coreCapacitorSource.includes('isSensitiveStorageKey'),
    ],
    installHint: 'pnpm add @aparajita/capacitor-secure-storage',
  },
  {
    id: 'biometric_auth',
    tier: 'P2',
    capability: 'Biometric Auth',
    plugins: ['@aparajita/capacitor-biometric-auth'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@aparajita/capacitor-biometric-auth'"),
      coreCapacitorSource.includes('BiometricAuth.checkBiometry'),
      coreCapacitorSource.includes('BiometricAuth.authenticate'),
    ],
    installHint: 'pnpm add @aparajita/capacitor-biometric-auth',
  },
  {
    id: 'app_update',
    tier: 'P2',
    capability: 'In-App Update',
    plugins: ['@capawesome/capacitor-app-update'],
    integrationChecks: [
      coreCapacitorSource.includes("from '@capawesome/capacitor-app-update'"),
      coreCapacitorSource.includes('AppUpdate.getAppUpdateInfo'),
      coreCapacitorSource.includes('AppUpdateAvailability.UPDATE_AVAILABLE'),
    ],
    installHint: 'pnpm add @capawesome/capacitor-app-update',
  },
];

const results = capabilityChecks.map((check) => {
  const pluginInstalled = check.plugins.every(
    (plugin) => workspaceManifests.some((manifest) => hasDependency(manifest, plugin)),
  );
  const pluginInCatalog = check.plugins.every((plugin) => workspaceYaml.includes(`'${plugin}'`));
  const integrationReady = check.integrationChecks.every(Boolean);
  const status = pluginInstalled && integrationReady ? 'ready' : pluginInstalled || integrationReady ? 'partial' : 'missing';

  return {
    ...check,
    pluginInstalled,
    pluginInCatalog,
    integrationReady,
    status,
  };
});

const now = new Date();
const dateLabel = now.toISOString().slice(0, 10);

console.log(`\nCapacitor Capability Audit (${dateLabel})`);
console.log('='.repeat(72));
console.log('Tier legend: P0 critical baseline, P1 high-value common, P2 hardening.\n');

for (const result of results) {
  console.log(
    `${result.tier.padEnd(3)} ${toStatusLabel(result.status).padEnd(7)} ${result.capability} (${result.id})`,
  );
  console.log(
    `      plugins: ${result.plugins.join(', ')} | installed=${result.pluginInstalled ? 'yes' : 'no'} | catalog=${result.pluginInCatalog ? 'yes' : 'no'} | integrated=${result.integrationReady ? 'yes' : 'no'}`,
  );
}

const missingOrPartial = results.filter((item) => item.status !== 'ready');
if (!missingOrPartial.length) {
  console.log('\nAll audited capabilities are ready.');
  process.exit(0);
}

console.log('\nActionable Upgrade Backlog');
console.log('-'.repeat(72));
for (const item of missingOrPartial) {
  console.log(
    `- [${item.tier}] ${item.capability}: status=${toStatusLabel(item.status)}, install hint: ${item.installHint}`,
  );
}

console.log('\nWorkspace Policy Reminder');
console.log('- Add missing plugin entries to `pnpm-workspace.yaml` catalog first.');
console.log('- Then reference them in root/core `package.json` using `catalog:`.');
console.log('- Finally run: `pnpm install && pnpm cap:sync`.');
