# Config Center V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a unified global configuration center that supports system/light/dark mode, theme presets, accent color configuration, global font scaling, and conversation-list tokenized styling.

**Architecture:** Keep `@sdkwork/react-mobile-settings` as the single persisted source of truth, add a schema-aware migration layer, and drive all runtime theme variables from a dedicated appearance resolver. `ThemeProvider` reads settings store and applies resolved CSS vars to root so pages/components consume semantic tokens only.

**Tech Stack:** React, TypeScript, Zustand, CSS variables, Vitest.

---

### Task 1: Define V2 Appearance Schema

**Files:**
- Modify: `packages/sdkwork-react-mobile-settings/src/types/index.ts`

**Step 1: Add appearance-related types**
- Add `AppearanceMode`, `ThemePreset`, `AccentType`, `AccentPreset`.

**Step 2: Extend `AppConfig`**
- Add V2 fields: `schemaVersion`, `appearanceMode`, `themePreset`, `accentType`, `accentPreset`, `accentHex`, `fontScale`.

**Step 3: Keep legacy fields compatible**
- Keep `theme` and `fontSize` in type for old usage.

**Step 4: Typecheck impacted references**
Run: `pnpm.cmd exec tsc -p tsconfig.json --noEmit`
Expected: no new schema type errors (legacy page errors may remain separately).

### Task 2: Add Migration + Normalization in Settings Service

**Files:**
- Modify: `packages/sdkwork-react-mobile-settings/src/services/SettingsService.ts`

**Step 1: Write migration helpers**
- Add constants for schema version/defaults.
- Add legacy theme -> mode/preset mapper.
- Add normalize and clamp utilities.

**Step 2: Normalize on initialize**
- Default config includes V2 fields and legacy mirrors.

**Step 3: Normalize on read/write**
- `getConfig` and `updateConfig` always return/persist normalized config.

**Step 4: Emit existing events unchanged**
- Keep `settings:theme_changed` and `settings:language_changed` compatibility.

### Task 3: Write Failing Tests for Appearance Resolver (TDD)

**Files:**
- Create: `src/services/theme/appearanceTokens.test.ts`
- Create: `src/services/theme/appearanceTokens.ts`

**Step 1: Write failing tests**
- Test system mode resolves to dark when OS prefers dark.
- Test preset accent selection.
- Test custom accent normalization.
- Test legacy theme alias mapping.

**Step 2: Run tests expecting failure**
Run: `pnpm.cmd exec vitest run src/services/theme/appearanceTokens.test.ts`
Expected: FAIL because resolver not implemented yet.

**Step 3: Implement minimal resolver**
- Return a resolved mode, legacy theme alias, CSS var map.

**Step 4: Re-run tests**
Run: `pnpm.cmd exec vitest run src/services/theme/appearanceTokens.test.ts`
Expected: PASS.

### Task 4: Integrate Resolver into Theme Provider

**Files:**
- Modify: `src/services/themeContext.tsx`
- Modify: `src/app/App.tsx` (if meta color API changes)

**Step 1: Replace local theme source with settings store source**
- Read config via `useSettingsStore`.

**Step 2: Add `prefers-color-scheme` subscription**
- Update resolved mode when OS theme changes and mode is `system`.

**Step 3: Apply CSS variables centrally**
- Set root vars and `data-theme` from resolver output.

**Step 4: Keep compatibility methods**
- Existing `setTheme` and `setFontSize` still work by writing config.

### Task 5: Upgrade Theme Page to Config Center

**Files:**
- Modify: `packages/sdkwork-react-mobile-settings/src/pages/ThemePage.tsx`
- Modify: `packages/sdkwork-react-mobile-settings/src/hooks/useSettings.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/i18n/zh.ts`
- Modify: `packages/sdkwork-react-mobile-settings/src/i18n/en.ts`
- Modify: `src/core/i18n/locales/zh-CN/user.ts`
- Modify: `src/core/i18n/locales/en-US/user.ts`

**Step 1: Add mode controls**
- `system/light/dark` segmented controls.

**Step 2: Add preset controls**
- Render style cards for preset selection.

**Step 3: Add accent controls**
- Preset accent chips + custom hex input.

**Step 4: Add font scale controls**
- Slider + preview text.

### Task 6: Tokenize Conversation List Colors

**Files:**
- Modify: `packages/sdkwork-react-mobile-chat/src/pages/ChatListPage.css`
- Modify: `packages/sdkwork-react-mobile-chat/src/components/ChatListItem.css`

**Step 1: Replace hard-coded colors with tokens**
- Empty icon/button gradients, shadow, divider, unread styles.

**Step 2: Ensure variables are provided by resolver**
- Add fallback values only where needed.

**Step 3: Visual sanity check in light/dark/system**
- Verify pinned/pressed/unread states.

### Task 7: Verification

**Files:**
- Verify modified files above.

**Step 1: Run focused tests**
- `pnpm.cmd exec vitest run src/services/theme/appearanceTokens.test.ts src/layouts/MobileLayout/visibility.test.ts`

**Step 2: Build check**
- `pnpm.cmd run build`
- If legacy broken pages fail, isolate and document as separate cleanup task.

**Step 3: Summarize migration behavior**
- Confirm old config autoupgrades and persists.

### Task 8: Legacy Cleanup (Allowed by requirement)

**Files:**
- Modify as needed: `src/pages/AgentsPage.tsx`, `src/pages/CreationPage.tsx`, `src/pages/SearchPage.tsx` or route isolation points.

**Step 1: Fix or isolate syntax-broken legacy pages**
- Ensure they no longer block full build.

**Step 2: Re-run build**
- `pnpm.cmd run build`

**Step 3: Document cleanup scope**
- Note what was fixed vs deferred.
