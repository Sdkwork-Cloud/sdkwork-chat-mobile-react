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

## Required Commands

- `pnpm cap:add:android`
- `pnpm cap:add:ios`
- `pnpm cap:sync`
- `pnpm cap:copy`
- `pnpm cap:open:android`
- `pnpm cap:open:ios`
- `pnpm cap:run:android`
- `pnpm cap:run:ios`
- `pnpm cap:doctor`

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
