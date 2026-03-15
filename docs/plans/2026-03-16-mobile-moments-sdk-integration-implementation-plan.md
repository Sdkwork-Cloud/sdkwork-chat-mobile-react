# Mobile Moments SDK Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the mobile moments module with `@sdkwork/app-sdk` feed/comment APIs without changing the existing page or store contracts.

**Architecture:** Add a dedicated `MomentsSdkService` for DTO mapping and API calls, then update `MomentsService` to orchestrate SDK-first reads and mutations with local storage fallback and cache sync.

**Tech Stack:** TypeScript, Zustand, Vitest, tsup, pnpm workspace, `@sdkwork/app-sdk`

---

### Task 1: Add regression tests for the SDK-first moments flow

**Files:**
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-moments/src/services/MomentsSdkService.test.ts`
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-moments/src/services/MomentsService.test.ts`

**Step 1: Write the failing test**

Cover:
- remote feed DTO mapping into `Moment`
- `MomentsService.getFeed` preferring SDK data over seed data
- local fallback when SDK is unavailable

**Step 2: Run tests to verify they fail**

Run:
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-moments/src/services/MomentsSdkService.test.ts`
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-moments/src/services/MomentsService.test.ts`

Expected: FAIL before implementation.

**Step 3: Write minimal implementation**

Implement `MomentsSdkService` and wire `MomentsService` to use it.

**Step 4: Run tests to verify they pass**

Run the same Vitest commands.
Expected: PASS

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-moments/src/services/MomentsSdkService.ts packages/sdkwork-react-mobile-moments/src/services/MomentsSdkService.test.ts packages/sdkwork-react-mobile-moments/src/services/MomentsService.ts packages/sdkwork-react-mobile-moments/src/services/MomentsService.test.ts
git commit -m "add mobile moments sdk integration"
```

### Task 2: Wire package exports and dependencies

**Files:**
- Modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-moments/src/services/index.ts`
- Modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-moments/package.json`

**Step 1: Use package build as the verification target**

Run: `pnpm.cmd --filter @sdkwork/react-mobile-moments build`

Expected: incomplete until exports and dependency wiring are correct.

**Step 2: Write minimal implementation**

- export `createMomentsSdkService` and `momentsSdkService`
- add `@sdkwork/app-sdk` dependency

**Step 3: Re-run package build**

Run: `pnpm.cmd --filter @sdkwork/react-mobile-moments build`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/sdkwork-react-mobile-moments/src/services/index.ts packages/sdkwork-react-mobile-moments/package.json
git commit -m "wire moments sdk package exports"
```

### Task 3: Verify workspace compatibility and publish git changes

**Files:**
- Modify: none expected

**Step 1: Run targeted verification**

Run:
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-moments/src/services/MomentsSdkService.test.ts`
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-moments/src/services/MomentsService.test.ts`
- `pnpm.cmd --filter @sdkwork/react-mobile-moments build`

Expected: PASS

**Step 2: Run workspace verification**

Run:
- `pnpm.cmd run build`
- `pnpm.cmd run validate:standards`
- `pnpm.cmd run check:sdk-standard`

Expected: PASS with only the known existing warnings accepted elsewhere in the repo.

**Step 3: Commit**

```bash
git add packages/sdkwork-react-mobile-moments docs/plans/2026-03-16-mobile-moments-sdk-integration-*.md
git commit -m "add mobile moments sdk integration"
git push origin main
```
