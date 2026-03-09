# Capacitor Build Standard

## Scope

This document defines the canonical Capacitor architecture for this workspace and the required build flow for Android and iOS packaging.

## Canonical App Target

- Capacitor shell: workspace root package `openchat-react-mobile`
- Web assets source: root Vite app (`src/`)
- Native sync source directory: `dist/`
- Feature modules: `packages/sdkwork-react-mobile-*` as imported workspace libraries

No package-level filter should be used for Capacitor shell commands. All Capacitor commands execute from the root app.

## Version Policy

- Capacitor major version is locked to the workspace catalog: `6.2.x`
- Source of truth: `pnpm-workspace.yaml` `catalog` entries for:
  - `@capacitor/core`
  - `@capacitor/cli`
  - `@capacitor/ios`
  - `@capacitor/android`

If upgrading to Capacitor 7+, update the catalog first, then all docs and scripts in one change set.

## Configuration Policy

`capacitor.config.ts` must follow these rules:

1. Use official typing from `@capacitor/cli`.
2. `webDir` must stay `dist`.
3. `server.url` is only enabled when `CAP_SERVER_URL` is explicitly provided.
4. Release builds must not set `CAP_SERVER_URL`.
5. Plugin defaults should remain deterministic across platforms.

## Core Capability Baseline

The following baseline capabilities are required for production mobile builds:

- Local notifications: `@capacitor/local-notifications`
- Push notifications: `@capacitor/push-notifications`
- Payment bridge launch: unified payment URL launcher through platform abstraction

Implementation contract:

1. `packages/sdkwork-react-mobile-core/src/platform/capacitor.ts` must use real Capacitor plugins for local and push notifications.
2. `packages/sdkwork-react-mobile-core/src/platform/web.ts` must provide safe degradation behavior for web runtime.
3. Payment flow is provider-agnostic in core: backend returns payment URL/scheme, app launches it through platform payment bridge.
4. Capability health must be auditable via `inspectPlatformCapabilities(...)` in core platform module.

## Required Commands

- `pnpm cap:add:android`
- `pnpm cap:add:ios`
- `pnpm cap:sync`
- `pnpm cap:permissions:sync`
- `pnpm cap:copy`
- `pnpm cap:open:android`
- `pnpm cap:open:ios`
- `pnpm cap:run:android`
- `pnpm cap:run:ios`
- `pnpm cap:doctor`
- `pnpm audit:capacitor:capabilities`

## Capability Audit Workflow

Run:

1. `pnpm audit:capacitor:capabilities`
2. Review P0/P1/P2 statuses in the console report.
3. For any `MISSING` or `PARTIAL` item:
   - Add plugin to `pnpm-workspace.yaml` catalog.
   - Reference plugin in root/core `package.json` with `catalog:`.
   - Implement bridge/runtime integration in `packages/sdkwork-react-mobile-core/src/platform/`.
4. Run `pnpm install && pnpm cap:sync`.

`pnpm cap:sync` already chains `pnpm cap:permissions:sync` to keep Android/iOS permission baseline aligned when native projects exist.

Default audit coverage includes:

- Push notifications / local notifications
- Payment launch bridge / deep-link callback
- Geolocation / browser OAuth fallback
- File picker / barcode scanner
- Secure storage / biometric auth / in-app update

## Native Permission Baseline (Call/Media)

Audio/video call and media workflows must include the following permission baseline.

### Android Manifest

Required file: `android/app/src/main/AndroidManifest.xml`

If native Android project is not checked in yet, maintain the baseline in:

- `config/android/AndroidManifest.permissions.template.xml`

Call/media critical permissions:

- `android.permission.CAMERA`
- `android.permission.RECORD_AUDIO`
- `android.permission.MODIFY_AUDIO_SETTINGS`
- `android.permission.FOREGROUND_SERVICE`
- `android.permission.FOREGROUND_SERVICE_CAMERA`
- `android.permission.FOREGROUND_SERVICE_MICROPHONE`
- `android.permission.BLUETOOTH_CONNECT`
- `android.permission.BLUETOOTH_SCAN`

Common runtime permissions:

- `android.permission.POST_NOTIFICATIONS`
- `android.permission.ACCESS_NETWORK_STATE`
- `android.permission.ACCESS_WIFI_STATE`
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.READ_MEDIA_AUDIO`
- `android.permission.READ_MEDIA_VIDEO`
- `android.permission.READ_EXTERNAL_STORAGE` (`maxSdkVersion=32`)

### iOS Info.plist

If `ios/` is not initialized yet, keep the baseline in:

- `config/ios/Info.plist.permissions.template.xml`

After running `pnpm cap:add:ios`, copy these keys into `ios/App/App/Info.plist`:

- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`
- `NSContactsUsageDescription`
- `NSBluetoothAlwaysUsageDescription`
- `NSLocalNetworkUsageDescription`
- `NSFaceIDUsageDescription`
- `UIBackgroundModes` with:
  - `audio`
  - `voip`
  - `remote-notification`

Minimum call capability gate:

1. Android has camera + microphone runtime permissions declared.
2. iOS Info.plist includes camera + microphone usage descriptions.
3. Permission baseline is re-checked with `pnpm audit:capacitor:capabilities`.

Runtime guard API (core):

- `inspectCallMediaPermissions(...)`
- `requestCallMediaPermissions(...)`
- `prepareCallMediaSession(...)`

These APIs are exported from `@sdkwork/react-mobile-core` platform module to enforce call permission preflight and audio fallback before opening RTC sessions.

Entry points that should invoke this preflight include:

- Contact profile "Voice/Video Call" button
- Call history redial entry
- Chat action panel video-call shortcut

## Packaging Flows

### Android

1. `pnpm build`
2. `pnpm cap:sync`
3. `pnpm cap:open:android`
4. In Android Studio, produce signed `.apk` or `.aab`

### iOS

1. `pnpm build`
2. `pnpm cap:sync`
3. `pnpm cap:open:ios`
4. In Xcode, archive and export `.ipa`

## Live Reload Flow (Native Debug)

1. Run `pnpm dev` in terminal A.
2. Set `CAP_SERVER_URL` in terminal B to your LAN URL (example: `http://192.168.1.23:3000`).
3. Run `pnpm cap:run:android` or `pnpm cap:run:ios`.

This avoids hardcoding development URLs in source and prevents accidental release builds pointing to local hosts.

## CI Verification Baseline

At minimum, CI should run:

1. `pnpm build`
2. `pnpm cap:doctor`
3. `pnpm cap:sync` (after platform projects are initialized)

If native directories are not checked into git, CI must initialize platform folders before `cap:sync`.
