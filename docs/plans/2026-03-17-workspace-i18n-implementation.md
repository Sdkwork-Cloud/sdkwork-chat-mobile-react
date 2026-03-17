# Workspace Internationalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the fragmented workspace localization approach with one shared runtime i18n system and eliminate direct Chinese copy from runtime source files.

**Architecture:** The app keeps the existing root translation hook surface but rebuilds it on top of a shared `i18next` instance. Root and package locale resources are deep-merged, routed pages keep receiving one shared translator, and locale-aware formatting plus runtime source auditing enforce consistent multilingual behavior.

**Tech Stack:** React, TypeScript, i18next, react-i18next, Vitest, pnpm workspace

---

### Task 1: Add shared i18n configuration and locale resolution

**Files:**
- Create: `src/core/i18n/config.ts`
- Create: `src/core/i18n/localeResolver.ts`
- Create: `src/core/i18n/resourceBuilder.ts`
- Modify: `src/core/i18n/I18nContext.tsx`
- Modify: `src/core/i18n/types.ts`
- Test: `src/core/i18n/localeResolver.test.ts`
- Test: `src/core/i18n/resourceBuilder.test.ts`

**Step 1: Write the failing tests**

Add tests that prove:

- `?locale=en-US` overrides all other sources.
- persisted settings override browser locale.
- unsupported locales normalize to `zh-CN`.
- package translation keys are present in merged resources.

**Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run src/core/i18n/localeResolver.test.ts src/core/i18n/resourceBuilder.test.ts`

Expected: failing tests due to missing resolver and resource builder behavior.

**Step 3: Write minimal implementation**

Implement:

- locale normalization helpers
- resolution priority logic
- deep merge for root and package resources
- an `i18next` bootstrap used by the root provider

**Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run src/core/i18n/localeResolver.test.ts src/core/i18n/resourceBuilder.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/core/i18n/config.ts src/core/i18n/localeResolver.ts src/core/i18n/resourceBuilder.ts src/core/i18n/I18nContext.tsx src/core/i18n/types.ts src/core/i18n/localeResolver.test.ts src/core/i18n/resourceBuilder.test.ts
git commit -m "feat(i18n): unify runtime locale resolution"
```

### Task 2: Add locale-aware formatters and wire runtime synchronization

**Files:**
- Create: `src/core/i18n/formatters.ts`
- Modify: `src/core/i18n/I18nContext.tsx`
- Modify: `src/router/index.tsx`
- Test: `src/core/i18n/formatters.test.ts`

**Step 1: Write the failing test**

Add tests that prove date, time, and number formatting change when locale changes from `zh-CN` to `en-US`.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/core/i18n/formatters.test.ts`

Expected: FAIL because the format helpers do not exist yet.

**Step 3: Write minimal implementation**

Implement shared formatter helpers and expose them through the root provider so routed pages can use active-locale formatting instead of browser defaults.

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/core/i18n/formatters.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/core/i18n/formatters.ts src/core/i18n/I18nContext.tsx src/router/index.tsx src/core/i18n/formatters.test.ts
git commit -m "feat(i18n): add locale-aware runtime formatters"
```

### Task 3: Remove isolated translation logic from search, settings, and agents

**Files:**
- Modify: `packages/sdkwork-react-mobile-search/src/pages/SearchPage.tsx`
- Modify: `packages/sdkwork-react-mobile-settings/src/hooks/useSettings.ts`
- Modify: `packages/sdkwork-react-mobile-agents/src/i18n/index.ts`
- Modify: `packages/sdkwork-react-mobile-agents/src/pages/AgentsPage.tsx`
- Test: `packages/sdkwork-react-mobile-settings/src/i18n/resolveSettingsTranslation.test.ts`
- Test: `packages/sdkwork-react-mobile-agents/src/pages/AgentsPage.scan.test.ts`

**Step 1: Write the failing tests**

Add or extend tests so they prove:

- search page resolves copy through shared translation keys.
- agents page follows root locale changes.
- settings hook does not drift from root locale resources.

**Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run packages/sdkwork-react-mobile-agents/src/pages/AgentsPage.scan.test.ts packages/sdkwork-react-mobile-settings/src/i18n/resolveSettingsTranslation.test.ts`

Expected: FAIL until the shared i18n wiring is in place.

**Step 3: Write minimal implementation**

Replace local dictionaries and mutable locale state with shared translator access while preserving the current page API.

**Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run packages/sdkwork-react-mobile-agents/src/pages/AgentsPage.scan.test.ts packages/sdkwork-react-mobile-settings/src/i18n/resolveSettingsTranslation.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-search/src/pages/SearchPage.tsx packages/sdkwork-react-mobile-settings/src/hooks/useSettings.ts packages/sdkwork-react-mobile-agents/src/i18n/index.ts packages/sdkwork-react-mobile-agents/src/pages/AgentsPage.tsx packages/sdkwork-react-mobile-settings/src/i18n/resolveSettingsTranslation.test.ts packages/sdkwork-react-mobile-agents/src/pages/AgentsPage.scan.test.ts
git commit -m "feat(i18n): align package modules with shared locale runtime"
```

### Task 4: Migrate hard-coded runtime copy and comments in high-risk pages

**Files:**
- Modify: `src/components/ErrorBoundary/index.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `packages/sdkwork-react-mobile-wallet/src/pages/WalletPage.tsx`
- Modify: `packages/sdkwork-react-mobile-video/src/pages/VideosPage.tsx`
- Modify: `packages/sdkwork-react-mobile-search/src/pages/SearchPage.tsx`
- Modify: other runtime files reported by the audit in this pass
- Test: `src/core/i18n/runtimeCopyAudit.test.ts`

**Step 1: Write the failing audit test**

Add a repository audit test that scans runtime source files and fails when non-locale runtime files contain Chinese characters or mojibake.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/core/i18n/runtimeCopyAudit.test.ts`

Expected: FAIL and list offending files.

**Step 3: Write minimal implementation**

Replace hard-coded Chinese UI text with shared translation keys or English fallback copy, and rewrite Chinese comments into English. Shrink the offender list to zero for the audited runtime scope.

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/core/i18n/runtimeCopyAudit.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ErrorBoundary/index.tsx src/pages/SettingsPage.tsx packages/sdkwork-react-mobile-wallet/src/pages/WalletPage.tsx packages/sdkwork-react-mobile-video/src/pages/VideosPage.tsx packages/sdkwork-react-mobile-search/src/pages/SearchPage.tsx src/core/i18n/runtimeCopyAudit.test.ts
git commit -m "feat(i18n): remove hard-coded runtime copy"
```

### Task 5: Replace browser-default formatting in user-facing pages

**Files:**
- Modify: `src/components/ChatListItem/ChatListItem.tsx`
- Modify: `src/utils/date.ts`
- Modify: `packages/sdkwork-react-mobile-commons/src/utils/date.ts`
- Modify: `packages/sdkwork-react-mobile-wallet/src/pages/WalletPage.tsx`
- Modify: `packages/sdkwork-react-mobile-appointments/src/pages/AppointmentsPage.tsx`
- Modify: `packages/sdkwork-react-mobile-communication/src/pages/CallsPage.tsx`
- Modify: `packages/sdkwork-react-mobile-notification/src/pages/NotificationPage.tsx`
- Modify: `packages/sdkwork-react-mobile-user/src/pages/MyActivityHistoryPage.tsx`
- Modify: other user-facing formatter call sites reported by search
- Test: `src/core/i18n/formatters.test.ts`

**Step 1: Write the failing test**

Extend formatter tests to prove the migrated pages and utilities no longer depend on browser-default locale behavior.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/core/i18n/formatters.test.ts`

Expected: FAIL until migrated helpers are used.

**Step 3: Write minimal implementation**

Update all user-facing formatter call sites to use the shared locale or formatter helpers explicitly.

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/core/i18n/formatters.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ChatListItem/ChatListItem.tsx src/utils/date.ts packages/sdkwork-react-mobile-commons/src/utils/date.ts packages/sdkwork-react-mobile-wallet/src/pages/WalletPage.tsx packages/sdkwork-react-mobile-appointments/src/pages/AppointmentsPage.tsx packages/sdkwork-react-mobile-communication/src/pages/CallsPage.tsx packages/sdkwork-react-mobile-notification/src/pages/NotificationPage.tsx packages/sdkwork-react-mobile-user/src/pages/MyActivityHistoryPage.tsx src/core/i18n/formatters.test.ts
git commit -m "feat(i18n): use active locale for formatting"
```

### Task 6: Verify workspace behavior

**Files:**
- Modify: any final touched files from verification findings

**Step 1: Run focused tests**

Run: `pnpm exec vitest run src/core/i18n/localeResolver.test.ts src/core/i18n/resourceBuilder.test.ts src/core/i18n/formatters.test.ts src/core/i18n/runtimeCopyAudit.test.ts`

Expected: PASS

**Step 2: Run package regression tests**

Run: `pnpm exec vitest run packages/sdkwork-react-mobile-agents/src/pages/AgentsPage.scan.test.ts packages/sdkwork-react-mobile-settings/src/i18n/resolveSettingsTranslation.test.ts packages/sdkwork-react-mobile-settings/src/pages/FeedbackPage.locale.test.tsx`

Expected: PASS

**Step 3: Run workspace typecheck**

Run: `pnpm typecheck`

Expected: PASS

**Step 4: Run workspace build if time permits**

Run: `pnpm build`

Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat(i18n): finalize workspace internationalization baseline"
```
