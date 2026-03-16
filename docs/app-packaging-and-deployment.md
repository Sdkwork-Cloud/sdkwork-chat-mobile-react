# App Packaging and Deployment Guide

## Scope

This document is the operational guide for packaging and deploying the mobile app in this repository.

It focuses on:

- Android packaging
- iOS packaging
- release preparation
- store submission flow
- common troubleshooting

This guide complements [docs/capacitor-build-standard.md](./capacitor-build-standard.md). The build standard defines architecture and baseline rules. This document explains the actual packaging and deployment workflow for release operations.

## App Target

- App shell package: `openchat-react-mobile`
- Web source: root app under `src/`
- Web build output: `dist/`
- Native wrapper: Capacitor
- Native projects:
  - Android: `android/`
  - iOS: `ios/` after initialization

All Capacitor commands must be executed at the repository root:

```bash
pnpm <command>
```

Do not run Capacitor packaging commands inside `packages/sdkwork-react-mobile-*`.

## Prerequisites

Before packaging, confirm the local environment is ready.

### Required Tooling

- Node.js `>= 18`
- pnpm `>= 10`
- Java / Android SDK / Android Studio for Android packaging
- Xcode and Apple developer signing assets for iOS packaging

### Java Policy For This Repository

- Android workflows in this repository use Java 21.
- Global Java 25 can remain the machine default for other backend projects.
- The project source of truth is `android/gradle.properties` with `org.gradle.java.home`.
- Root Android scripts such as `pnpm cap:open:android` and `pnpm cap:run:android` launch child processes through `scripts/run-with-project-java-home.mjs`.
- In Android Studio, use the same Java 21 installation as the project Gradle JDK for this repository.

### Repository Setup

Install dependencies:

```bash
pnpm install
```

If native platforms are not initialized yet, add them first:

```bash
pnpm cap:add:android
pnpm cap:add:ios
```

### Environment Files

Prepare the correct environment file before release:

- `.env.production`
- or a release-specific environment source managed by your CI/CD pipeline

Release builds must not use `CAP_SERVER_URL`.

## Release Readiness Checklist

Run this checklist before every release:

1. Confirm the correct environment configuration is in use.
2. Run standards and capability validation.
3. Build the web app.
4. Sync Capacitor assets and native permissions.
5. Open the native project and create a signed release build.

Recommended commands:

```bash
pnpm validate:standards
pnpm validate:capacitor:baseline
pnpm build
pnpm cap:sync
```

If you want one command sequence for app packaging preparation:

```bash
pnpm build:app
```

`pnpm build:app` does:

1. `pnpm build`
2. `pnpm cap:sync`

## Versioning and Release Metadata

Before publishing:

- confirm app name and package identifiers are correct in `capacitor.config.ts`
- confirm release version and build number are updated in native projects
- confirm icons, splash resources, and permission descriptions are correct

Typical items to verify:

- `capacitor.config.ts`
- Android app version fields in Gradle configuration
- iOS marketing version and build number in Xcode
- Android signing configuration
- iOS signing team, bundle identifier, and capabilities

## Standard Packaging Flow

Use this sequence as the default release flow:

```bash
pnpm validate:standards
pnpm validate:capacitor:baseline
pnpm build
pnpm cap:sync
```

Then continue with platform-specific packaging in Android Studio or Xcode.

## Android Packaging

### Step 1: Build and Sync

```bash
pnpm build
pnpm cap:sync
```

Or:

```bash
pnpm build:app
```

### Step 2: Open Android Studio

```bash
pnpm cap:open:android
```

### Step 3: Verify Android Release Configuration

Inside Android Studio, confirm:

- application id is correct
- version name and version code are correct
- signing config uses the intended keystore
- runtime permissions match release expectations
- push / notifications / file / media permissions are present if required by released features

### Step 4: Produce Release Artifact

In Android Studio:

1. Open `Build`
2. Choose `Generate Signed Bundle / APK`
3. Prefer `Android App Bundle (.aab)` for Google Play
4. Use signed `APK` only for local distribution or internal testing when needed

Recommended outputs:

- Google Play production: `.aab`
- Internal QA / direct install: signed `.apk`

### Step 5: Deploy Android Build

Deployment options:

- Google Play Console
- internal test distribution platform
- direct secure file delivery for enterprise/internal use

For Google Play:

1. Upload the `.aab`
2. Complete release notes
3. Review permissions and policy declarations
4. Roll out to internal testing, closed testing, or production

## iOS Packaging

### Step 1: Initialize iOS Project if Needed

If `ios/` does not exist yet:

```bash
pnpm cap:add:ios
```

### Step 2: Build and Sync

```bash
pnpm build
pnpm cap:sync
```

Or:

```bash
pnpm build:app
```

### Step 3: Open Xcode

```bash
pnpm cap:open:ios
```

### Step 4: Verify iOS Signing and Capabilities

Inside Xcode, confirm:

- bundle identifier is correct
- team and signing certificate are correct
- provisioning profile is correct
- version and build number are correct
- `Info.plist` contains all required privacy descriptions
- required background modes and capabilities are enabled

### Step 5: Archive the App

In Xcode:

1. Select a release target or generic iOS device
2. Run `Product > Archive`
3. Open Organizer
4. Validate the archive
5. Export or upload

Recommended outputs:

- TestFlight / App Store: upload archive through Organizer
- enterprise or ad hoc distribution: export signed `.ipa`

### Step 6: Deploy iOS Build

Deployment options:

- TestFlight
- App Store release
- enterprise distribution
- ad hoc distribution

Recommended flow:

1. Upload archive to App Store Connect
2. Distribute to TestFlight first
3. Complete app review metadata
4. Release to production after validation

## Internal Testing Flow

Use internal testing before store production rollout.

### Android Internal Testing

- create signed `.apk` or `.aab`
- distribute via internal test track or QA distribution platform
- verify login, notifications, payment callback, camera, storage, and media permissions

### iOS Internal Testing

- upload to TestFlight
- validate signing, launch, permissions, deep links, push registration, payment callback, and media permissions

## Recommended Release Order

For stable release delivery, use this order:

1. Run standards validation.
2. Run Capacitor baseline validation.
3. Build web assets.
4. Sync native projects.
5. Produce Android release artifact.
6. Produce iOS archive.
7. Deploy to internal test channels.
8. Complete regression verification.
9. Roll out to production stores.

## CI/CD Recommendation

At minimum, CI for release branches should run:

```bash
pnpm validate:standards
pnpm build
pnpm cap:doctor
pnpm cap:sync
```

Recommended release pipeline stages:

1. dependency install
2. standards validation
3. web build
4. Capacitor sync
5. native archive / bundle generation
6. artifact upload
7. manual approval
8. store submission

## Common Commands

### Development

```bash
pnpm dev
pnpm dev:android
pnpm dev:ios
```

### Build and Packaging

```bash
pnpm build
pnpm build:app
pnpm cap:sync
pnpm cap:copy
pnpm cap:open:android
pnpm cap:open:ios
pnpm cap:run:android
pnpm cap:run:ios
pnpm cap:doctor
```

### Validation

```bash
pnpm validate:standards
pnpm validate:capacitor:baseline
pnpm verify:permissions:baseline
pnpm audit:capacitor:capabilities
```

## Troubleshooting

### `cap:sync` completed but native changes are not visible

Try:

```bash
pnpm build
pnpm cap:sync
```

Then reopen Android Studio or Xcode.

### Native permissions look out of sync

Run:

```bash
pnpm cap:permissions:sync
pnpm verify:permissions:baseline
```

### Release build still points to a development server

Check:

- `CAP_SERVER_URL` is not set
- `capacitor.config.ts` does not enable `server.url` for release packaging

### Plugin added but native app does not recognize it

Run:

```bash
pnpm install
pnpm cap:sync
pnpm cap:doctor
```

If still broken, verify:

- dependency exists in `pnpm-workspace.yaml` catalog
- dependency exists in root `package.json`
- runtime integration exists in core platform code

### Android or iOS packaging fails after a build passes

Check:

- native signing configuration
- native version metadata
- permission descriptions
- SDK / Xcode / Gradle environment state
- plugin compatibility with the current Capacitor major version

## Release Sign-Off Checklist

Before production submission, confirm:

- `pnpm validate:standards` passed
- `pnpm validate:capacitor:baseline` passed
- web assets were rebuilt
- native assets were synced
- Android signed package was generated
- iOS archive was generated
- internal testing passed
- release notes and store metadata were updated
- no development server configuration remains enabled

## Suggested Ownership

- Engineering: build, sync, native packaging, technical validation
- QA: internal test verification
- Release owner: artifact upload, rollout approval, store metadata, final submission

## Related Files

- [package.json](../package.json)
- [capacitor.config.ts](../capacitor.config.ts)
- [docs/capacitor-build-standard.md](./capacitor-build-standard.md)
- [config/android/AndroidManifest.permissions.template.xml](../config/android/AndroidManifest.permissions.template.xml)
- [config/ios/Info.plist.permissions.template.xml](../config/ios/Info.plist.permissions.template.xml)
