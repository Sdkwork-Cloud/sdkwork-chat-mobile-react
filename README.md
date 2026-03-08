<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SDKWork Chat Mobile React

React + Vite + Capacitor mobile workspace.

## Run Locally

**Prerequisites:** Node.js 18+, pnpm 10+

1. Install dependencies:
   `pnpm install`
2. Prepare environment file (aligned with `magic-studio-v2`):
   `copy .env.development.example .env.development`
3. Fill required variables:
   `VITE_API_BASE_URL`, `VITE_IM_API_BASE_URL`, `VITE_ACCESS_TOKEN`
4. Start development server:
   `pnpm dev`

## Capacitor Architecture

- Canonical Capacitor app shell: workspace root (`openchat-react-mobile`)
- Feature modules: `packages/sdkwork-react-mobile-*`
- Native project config: `capacitor.config.ts`
- Web build output for native shells: `dist/`

All native commands now run from the root app and no longer depend on the removed `openchat-mobile-app` package filter.

## Capacitor Commands

- Bootstrap native projects:
  - Android: `pnpm cap:add:android`
  - iOS: `pnpm cap:add:ios`
- Sync web assets to native:
  - `pnpm cap:sync`
- Open native IDE projects:
  - Android Studio: `pnpm cap:open:android`
  - Xcode: `pnpm cap:open:ios`
- Run native shells:
  - Android: `pnpm cap:run:android`
  - iOS: `pnpm cap:run:ios`
- Diagnostics:
  - `pnpm cap:doctor`

## Cross-Platform Build Flow

1. Build web assets:
   `pnpm build`
2. Sync into native projects:
   `pnpm cap:sync`
3. Open platform project:
   `pnpm cap:open:android` or `pnpm cap:open:ios`
4. Archive/package in native IDE:
   - Android: generate `.apk` / `.aab`
   - iOS: archive `.ipa` through Xcode

### Native Live Reload (Optional)

`capacitor.config.ts` reads `CAP_SERVER_URL`. Keep it empty for release builds.

Example:
- Terminal A: `pnpm dev`
- Terminal B: set `CAP_SERVER_URL` to your LAN URL (for example `http://192.168.1.23:3000`) and run `pnpm cap:run:android` or `pnpm cap:run:ios`.

## Environment Modes

- Development: `pnpm dev` (uses `--mode development`)
- Staging dev server: `pnpm dev:staging` (uses `--mode staging`)
- Production build: `pnpm build` (Vite default mode `production`)
- Staging build: `pnpm build:staging`

Use these mode templates as baselines:

- `.env.development.example`
- `.env.staging.example`
- `.env.production.example`
- `.env.example` (full reference template, same key set as `magic-studio-v2`)
