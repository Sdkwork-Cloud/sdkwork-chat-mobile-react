# Mobile Runtime Unification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify Browser H5, PWA, and Capacitor App under one runtime architecture, remove active legacy platform paths, and enforce platform, shell, PWA, and Capacitor standards through code, tests, and validation gates.

**Architecture:** Move runtime ownership fully into `@sdkwork/react-mobile-core/platform`, keep the root app focused on shell composition, and introduce a single bootstrap flow for browser, PWA, and Capacitor. Preserve current native capability strengths while adding PWA baseline support, shell normalization, storage migration compatibility, and standards-as-code gates.

**Tech Stack:** React, TypeScript, Vite, vite-plugin-pwa, Capacitor, Vitest, Node.js validation scripts.

---

### Task 1: Add a Single Bootstrap Entry

**Files:**
- Create: `src/app/bootstrapApp.ts`
- Create: `src/app/bootstrapApp.test.ts`
- Modify: `index.tsx`
- Modify: `src/app/App.tsx`

**Step 1: Write the failing bootstrap test**

```ts
import { describe, expect, it, vi } from 'vitest';

describe('bootstrapApp', () => {
  it('initializes platform runtime once before rendering', async () => {
    const initializePlatform = vi.fn(async () => {});
    const initializePlatformRuntime = vi.fn(async () => () => {});
    const renderApp = vi.fn();

    const { bootstrapApp } = await import('./bootstrapApp');
    await bootstrapApp({
      initializePlatform,
      initializePlatformRuntime,
      renderApp,
    });

    expect(initializePlatform).toHaveBeenCalledTimes(1);
    expect(initializePlatformRuntime).toHaveBeenCalledTimes(1);
    expect(renderApp).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run src/app/bootstrapApp.test.ts`
Expected: FAIL because `bootstrapApp` does not exist yet.

**Step 3: Write the minimal bootstrap implementation**

```ts
export async function bootstrapApp(deps = defaultDeps) {
  await deps.initializePlatform();
  await deps.initializePlatformRuntime();
  await deps.renderApp();
}
```

**Step 4: Rewire the root entry**
- Make `index.tsx` import global styles and call `bootstrapApp()`.
- Remove direct `PlatformManager.setInstance(new WebPlatform())` setup from the root entry.
- Keep `App.tsx` focused on UI/runtime readiness rather than top-level platform ownership.

**Step 5: Re-run the focused test**

Run: `pnpm.cmd exec vitest run src/app/bootstrapApp.test.ts`
Expected: PASS.

### Task 2: Thin the Root Platform Facade and Remove Legacy Runtime Injection

**Files:**
- Modify: `src/platform/index.ts`
- Modify: `src/platform/index.test.ts`
- Delete or retire active usage of: `src/platform-impl/web/index.ts`
- Create: `scripts/platform-legacy-usage.test.ts`

**Step 1: Write a failing compatibility test**
- Extend `src/platform/index.test.ts` to assert that root platform exports delegate to core runtime behavior and no longer depend on legacy platform injection.

**Step 2: Run test to confirm failure or missing behavior**

Run: `pnpm.cmd exec vitest run src/platform/index.test.ts`
Expected: FAIL if root facade still assumes pre-injected web runtime behavior.

**Step 3: Refactor `src/platform/index.ts`**
- Keep compatibility exports for current app code.
- Remove any independent runtime state that duplicates core ownership where possible.
- Make fallback behavior explicitly depend on core initialization outcomes only.

**Step 4: Add an architecture guard test**
- Add a small test or script fixture proving the active entry path no longer imports `src/platform-impl/web`.

**Step 5: Re-run focused tests**

Run: `pnpm.cmd exec vitest run src/platform/index.test.ts scripts/platform-legacy-usage.test.ts`
Expected: PASS.

### Task 3: Move Legacy Browser Storage Migration into Core Web Runtime

**Files:**
- Create: `packages/sdkwork-react-mobile-core/src/platform/webStorageMigration.ts`
- Create: `packages/sdkwork-react-mobile-core/src/platform/webStorageMigration.test.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/platform/web.ts`
- Modify: `src/platform-impl/web/index.ts` or replace with explicit legacy stub if retained temporarily

**Step 1: Write the failing migration test**

```ts
it('moves legacy localStorage keys into the new web storage path once', async () => {
  localStorage.setItem('sys_chat_sessions_v4', JSON.stringify([{ id: '1' }]));
  const result = await migrateLegacyWebStorage({ set: async () => {} });
  expect(result.migratedKeys).toContain('sys_chat_sessions_v4');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/platform/webStorageMigration.test.ts`
Expected: FAIL because migration utility does not exist yet.

**Step 3: Implement migration utility**
- Extract the one-time migration key list from legacy web platform code.
- Make the migration idempotent.
- Make core web platform initialization call this migration utility.

**Step 4: Keep legacy path non-authoritative**
- If `src/platform-impl/web/index.ts` remains temporarily, remove data ownership logic from it or clearly mark it unused by runtime entry.

**Step 5: Re-run focused tests**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/platform/webStorageMigration.test.ts`
Expected: PASS.

### Task 4: Add PWA Runtime and Build Baseline

**Files:**
- Modify: `vite.config.ts`
- Modify: `index.html`
- Create: `public/manifest.webmanifest`
- Create: `src/pwa/registerPwa.ts`
- Create: `src/pwa/registerPwa.test.ts`

**Step 1: Write the failing PWA registration test**
- Assert that `registerPwa()` safely no-ops when service workers are unsupported and registers once when supported.

**Step 2: Run test to verify failure**

Run: `pnpm.cmd exec vitest run src/pwa/registerPwa.test.ts`
Expected: FAIL because PWA registration utility does not exist yet.

**Step 3: Implement the minimal runtime**
- Add `VitePWA(...)` to root Vite config.
- Add manifest file and required mobile metadata.
- Create `registerPwa()` with safe browser checks and version-update behavior.

**Step 4: Connect bootstrap to PWA registration**
- Browser-like environments call `registerPwa()` during bootstrap after platform/runtime init.
- Failures must log and degrade to normal H5 behavior.

**Step 5: Re-run focused tests**

Run: `pnpm.cmd exec vitest run src/pwa/registerPwa.test.ts`
Expected: PASS.

### Task 5: Normalize Mobile Shell Safe Area and Keyboard Contracts

**Files:**
- Modify: `src/mobile/hooks/useSafeArea.ts`
- Modify: `src/styles/safe-area.css`
- Modify: `src/layouts/MobileLayout/MobileLayout.tsx`
- Modify: `src/layouts/MobileLayout/MobileLayout.css`
- Create: `src/mobile/hooks/useSafeArea.test.ts`
- Create: `src/layouts/MobileLayout/MobileLayout.shell.test.tsx`

**Step 1: Write the failing safe-area and shell tests**
- Test that safe-area values normalize to zero when unavailable.
- Test that tabbar layout reserves bottom interaction space.
- Test that disabling bottom safe area for chat-like screens remains explicit.

**Step 2: Run tests to confirm failure**

Run: `pnpm.cmd exec vitest run src/mobile/hooks/useSafeArea.test.ts src/layouts/MobileLayout/MobileLayout.shell.test.tsx`
Expected: FAIL because the hook is still a placeholder and shell contract is not covered.

**Step 3: Implement normalized shell behavior**
- Read safe-area values from CSS/runtime consistently.
- Expose normalized insets from `useSafeArea`.
- Keep `MobileLayout` as the single owner of shell bottom reservation behavior.

**Step 4: Re-run focused tests**

Run: `pnpm.cmd exec vitest run src/mobile/hooks/useSafeArea.test.ts src/layouts/MobileLayout/MobileLayout.shell.test.tsx`
Expected: PASS.

### Task 6: Centralize Theme Color and Native Status Bar Synchronization

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/theme/themeContext.tsx`
- Create: `src/theme/statusBarSync.test.ts`

**Step 1: Write the failing synchronization test**
- Verify theme changes update browser theme-color metadata and do not break when native status bar APIs are unavailable.

**Step 2: Run test to verify failure**

Run: `pnpm.cmd exec vitest run src/theme/statusBarSync.test.ts`
Expected: FAIL because there is no dedicated synchronization contract test yet.

**Step 3: Implement shell-owned sync behavior**
- Keep browser `meta[name="theme-color"]` updates centralized.
- If native status bar control is available through the platform wrapper, synchronize it from the same effect path.

**Step 4: Re-run focused test**

Run: `pnpm.cmd exec vitest run src/theme/statusBarSync.test.ts`
Expected: PASS.

### Task 7: Add Architecture Validation Gates

**Files:**
- Create: `scripts/validate-platform-architecture.mjs`
- Create: `scripts/validate-pwa-baseline.mjs`
- Create: `scripts/validate-mobile-shell-baseline.mjs`
- Create: `scripts/platform-architecture-schema.test.ts`
- Modify: `package.json`

**Step 1: Write failing script tests**
- Assert platform validation fails on direct raw `@capacitor/*` imports outside approved core locations.
- Assert PWA validation fails when manifest or registration path is missing.
- Assert shell validation fails when safe-area or shell reservation hooks are absent.

**Step 2: Run tests to confirm failure**

Run: `pnpm.cmd exec vitest run scripts/platform-architecture-schema.test.ts`
Expected: FAIL because the validation scripts do not exist yet.

**Step 3: Implement validation scripts**
- Scan source paths with allowlists.
- Validate active entrypoint, manifest presence, PWA registration, and shell baseline files.
- Add package scripts:
  - `validate:platform:architecture`
  - `validate:pwa:baseline`
  - `validate:mobile-shell`
- Chain them into `validate:standards`.

**Step 4: Re-run focused tests**

Run: `pnpm.cmd exec vitest run scripts/platform-architecture-schema.test.ts`
Expected: PASS.

### Task 8: Update Architecture Standards Documentation

**Files:**
- Modify: `docs/mobile-shell-architecture.md`
- Modify: `docs/capacitor-build-standard.md`
- Modify: `docs/architect-standard-react+capacitor.md`

**Step 1: Document actual runtime ownership**
- State that core platform is the only runtime truth.
- Remove stale assumptions about legacy root platform injection.

**Step 2: Add PWA baseline coverage**
- Document manifest, service worker, update behavior, and browser fallback expectations.

**Step 3: Align shell and Capacitor docs**
- Describe shell reservation, safe area, keyboard, and status bar rules.
- Ensure native build standard matches actual runtime startup path.

**Step 4: Verify docs reference real commands and files**

Run: `cmd /c rg -n "src/platform-impl/web|PlatformManager.setInstance|manifest.webmanifest|validate:pwa:baseline|validate:platform:architecture" docs`
Expected: docs only reference intended final architecture.

### Task 9: Add End-to-End Runtime Verification Coverage

**Files:**
- Modify: `packages/sdkwork-react-mobile-core/tests/platformRuntimeHooks.test.ts`
- Modify: `packages/sdkwork-react-mobile-core/tests/capabilitiesAudit.test.ts`
- Create: `src/app/runtimeBootstrap.integration.test.ts`

**Step 1: Write failing integration-oriented tests**
- Verify runtime bootstrap still wires network/app foreground retry flushing.
- Verify capability inspection remains accurate after platform facade changes.
- Verify browser bootstrap does not break when PWA registration fails.

**Step 2: Run tests to confirm failure**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/tests/platformRuntimeHooks.test.ts packages/sdkwork-react-mobile-core/tests/capabilitiesAudit.test.ts src/app/runtimeBootstrap.integration.test.ts`
Expected: at least one FAIL due to missing integration updates.

**Step 3: Implement minimal code changes**
- Adjust runtime bootstrap and wrappers until tests pass without regressing capability checks.

**Step 4: Re-run focused tests**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/tests/platformRuntimeHooks.test.ts packages/sdkwork-react-mobile-core/tests/capabilitiesAudit.test.ts src/app/runtimeBootstrap.integration.test.ts`
Expected: PASS.

### Task 10: Final Verification

**Files:**
- Verify all files touched in Tasks 1-9

**Step 1: Run targeted tests**

Run: `pnpm.cmd exec vitest run src/app/bootstrapApp.test.ts src/platform/index.test.ts packages/sdkwork-react-mobile-core/src/platform/webStorageMigration.test.ts src/pwa/registerPwa.test.ts src/mobile/hooks/useSafeArea.test.ts src/layouts/MobileLayout/MobileLayout.shell.test.tsx src/theme/statusBarSync.test.ts scripts/platform-architecture-schema.test.ts src/app/runtimeBootstrap.integration.test.ts`
Expected: PASS.

**Step 2: Run standards gate**

Run: `pnpm.cmd validate:standards`
Expected: PASS, including existing Capacitor baseline plus new architecture/PWA/shell checks.

**Step 3: Run build check**

Run: `pnpm.cmd run build`
Expected: PASS for the root app.

**Step 4: Run capability baseline check again**

Run: `pnpm.cmd validate:capacitor:baseline`
Expected: PASS with no regression in native capability readiness.

**Step 5: Commit**

```bash
git add index.tsx src/app/bootstrapApp.ts src/app/bootstrapApp.test.ts src/app/App.tsx src/platform/index.ts src/platform/index.test.ts packages/sdkwork-react-mobile-core/src/platform/web.ts packages/sdkwork-react-mobile-core/src/platform/webStorageMigration.ts packages/sdkwork-react-mobile-core/src/platform/webStorageMigration.test.ts vite.config.ts index.html public/manifest.webmanifest src/pwa/registerPwa.ts src/pwa/registerPwa.test.ts src/mobile/hooks/useSafeArea.ts src/mobile/hooks/useSafeArea.test.ts src/layouts/MobileLayout/MobileLayout.tsx src/layouts/MobileLayout/MobileLayout.css src/layouts/MobileLayout/MobileLayout.shell.test.tsx src/theme/themeContext.tsx src/theme/statusBarSync.test.ts scripts/validate-platform-architecture.mjs scripts/validate-pwa-baseline.mjs scripts/validate-mobile-shell-baseline.mjs scripts/platform-architecture-schema.test.ts package.json docs/mobile-shell-architecture.md docs/capacitor-build-standard.md docs/architect-standard-react+capacitor.md
git commit -m "refactor(platform): unify web pwa and capacitor runtime"
```
