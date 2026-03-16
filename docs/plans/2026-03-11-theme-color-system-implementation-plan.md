# Theme Color System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the app appearance system with curated theme color schemes, a lobster default, safe legacy accent migration, and a more polished settings experience.

**Architecture:** Preserve the current `themePreset + accentPreset` architecture. Introduce one shared theme color metadata source used by settings defaults, normalization, appearance token generation, and the appearance settings page. Keep custom hex support as a secondary advanced path.

**Tech Stack:** TypeScript, React, Vitest, React DOM server

---

### Task 1: Lock the new theme color behavior with failing tests

**Files:**
- Modify: `packages/sdkwork-react-mobile-settings/src/services/SettingsService.test.ts`
- Modify: `src/theme/appearanceTokens.test.ts`
- Create: `packages/sdkwork-react-mobile-settings/src/pages/ThemePage.themeOptions.test.tsx`

**Step 1: Write the failing test**

Update tests to require:
- `lobster` as the default appearance preset after reset
- legacy accent aliases normalize to the new preset catalog
- `resolveAppearanceTheme` supports the new preset names
- the theme page renders named theme color scheme options and exposes lobster as a selectable scheme

**Step 2: Run tests to verify they fail**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-settings/src/services/SettingsService.test.ts src/theme/appearanceTokens.test.ts packages/sdkwork-react-mobile-settings/src/pages/ThemePage.themeOptions.test.tsx`
Expected: FAIL because the current system still uses the old preset names and the old settings page UI.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement shared theme color metadata and settings defaults

**Files:**
- Create: `packages/sdkwork-react-mobile-settings/src/themeColorPresets.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/types/index.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/services/SettingsService.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/index.ts`
- Modify: `src/theme/themeContext.tsx`

**Step 1: Write minimal implementation**

Implement:
- curated preset metadata
- lobster default
- legacy preset alias normalization
- shared exports for reuse

**Step 2: Run tests to verify the service and default behavior pass**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-settings/src/services/SettingsService.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 3: Apply preset-aware appearance token resolution

**Files:**
- Modify: `src/theme/appearanceTokens.ts`
- Modify: `src/theme/appearanceTokens.test.ts`

**Step 1: Write minimal implementation**

Use the shared preset metadata so named schemes can provide richer gradient behavior than the generic color-mix path. Keep custom hex input behavior intact.

**Step 2: Run tests to verify token behavior passes**

Run: `pnpm.cmd exec vitest run src/theme/appearanceTokens.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 4: Upgrade the appearance settings page

**Files:**
- Modify: `packages/sdkwork-react-mobile-settings/src/pages/ThemePage.tsx`
- Modify: `packages/sdkwork-react-mobile-settings/src/hooks/useSettings.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/i18n/en.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/i18n/zh.ts`
- Modify: `src/core/i18n/locales/en-US/user.ts`
- Modify: `src/core/i18n/locales/zh-CN/user.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/pages/ThemePage.themeOptions.test.tsx`

**Step 1: Write minimal implementation**

Replace anonymous accent dots with named scheme cards, preserve theme preset selection, keep custom hex as an advanced section, and add the new translation keys required by the refined UI.

**Step 2: Run targeted UI and regression tests**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-settings/src/services/SettingsService.test.ts src/theme/appearanceTokens.test.ts packages/sdkwork-react-mobile-settings/src/pages/ThemePage.themeOptions.test.tsx`
Expected: PASS

**Step 3: Run build verification**

Run: `pnpm.cmd run build`
Expected: PASS, or report any pre-existing unrelated failures with evidence.

**Step 4: Commit**

Skip commit in this session.
