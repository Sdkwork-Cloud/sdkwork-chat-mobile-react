# Mobile Search SDK Results Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate SDK-backed global search results into the mobile search module without changing the existing page or result group contracts.

**Architecture:** Extend `SearchSdkService` with content search mapping and update `SearchService` to use those SDK results for the `others` group when performing non-context global search.

**Tech Stack:** TypeScript, Vitest, Zustand, tsup, pnpm workspace, `@sdkwork/app-sdk`

---

### Task 1: Add failing regression tests for SDK-backed search results

**Files:**
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-search/src/services/SearchSdkService.test.ts`
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-search/src/services/SearchService.test.ts`

**Step 1: Write the failing tests**

Cover:
- mapping SDK global search `assets/notes/projects` into `SearchResultItem`
- `SearchService.search` preferring SDK-backed `others` on global searches

**Step 2: Run tests to verify they fail**

Run:
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-search/src/services/SearchSdkService.test.ts`
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-search/src/services/SearchService.test.ts`

Expected: FAIL before implementation.

**Step 3: Write minimal implementation**

Extend `SearchSdkService` and wire `SearchService`.

**Step 4: Re-run tests**

Expected: PASS

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-search/src/services/SearchSdkService.ts packages/sdkwork-react-mobile-search/src/services/SearchSdkService.test.ts packages/sdkwork-react-mobile-search/src/services/SearchService.ts packages/sdkwork-react-mobile-search/src/services/SearchService.test.ts
git commit -m "add mobile search sdk results integration"
```

### Task 2: Wire package dependency

**Files:**
- Modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-search/package.json`

**Step 1: Use package build as verification**

Run: `pnpm.cmd --filter @sdkwork/react-mobile-search build`

**Step 2: Write minimal implementation**

Add `@sdkwork/app-sdk` as a workspace dependency if missing.

**Step 3: Re-run package build**

Expected: PASS

### Task 3: Verify workspace compatibility and publish changes

**Step 1: Run targeted verification**

Run:
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-search/src/services/SearchSdkService.test.ts`
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-search/src/services/SearchService.test.ts`
- `pnpm.cmd --filter @sdkwork/react-mobile-search build`

**Step 2: Run workspace verification**

Run:
- `pnpm.cmd run build`
- `pnpm.cmd run validate:standards`
- `pnpm.cmd run check:sdk-standard`

**Step 3: Commit and push**

```bash
git add packages/sdkwork-react-mobile-search docs/plans/2026-03-16-mobile-search-sdk-results-*.md
git commit -m "add mobile search sdk results integration"
git push origin main
```
