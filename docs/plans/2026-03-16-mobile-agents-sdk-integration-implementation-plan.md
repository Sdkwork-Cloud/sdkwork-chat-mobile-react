# Mobile Agents SDK Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add SDK-first, local-fallback agent metadata integration to the mobile agents package without touching chat flows.

**Architecture:** Keep `AgentService` as the module facade. Route agent list/detail/favorite/default operations through `AgentSdkService` when possible, then sync results into local storage so existing hooks, pages, and stores remain unchanged.

**Tech Stack:** TypeScript, Vitest, pnpm workspace, Vite library build, `@sdkwork/app-sdk`

---

### Task 1: Add regression coverage for SDK-first service behavior

**Files:**
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-agents/src/services/AgentService.test.ts`

**Step 1: Write the failing test**

Cover:
- `getAgents` uses SDK data and decorates default/favorite state from local storage.
- `toggleFavorite` calls the SDK mutation before persisting local state.

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-agents/src/services/AgentService.test.ts`
Expected: FAIL because current `AgentService` does not use `AgentSdkService`.

**Step 3: Write minimal implementation**

Modify `AgentService` to instantiate `AgentSdkService`, sync remote agent metadata into storage, and call remote like/unlike on favorite toggle.

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-agents/src/services/AgentService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-agents/src/services/AgentService.test.ts packages/sdkwork-react-mobile-agents/src/services/AgentService.ts
git commit -m "add mobile agents sdk integration"
```

### Task 2: Publish package wiring for the new SDK adapter

**Files:**
- Modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-agents/src/index.ts`
- Modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-agents/package.json`

**Step 1: Write the failing test**

Use package build/type resolution as the verification target for export and dependency wiring.

**Step 2: Run build to verify it fails or remains incomplete**

Run: `pnpm.cmd --filter @sdkwork/react-mobile-agents build`
Expected: build remains incomplete until exports and dependency wiring are correct.

**Step 3: Write minimal implementation**

- Export `agentSdkService` and `createAgentSdkService`.
- Add `@sdkwork/app-sdk` as a workspace dependency.

**Step 4: Run build to verify it passes**

Run: `pnpm.cmd --filter @sdkwork/react-mobile-agents build`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-agents/src/index.ts packages/sdkwork-react-mobile-agents/package.json
git commit -m "wire agents sdk package exports"
```

### Task 3: Verify workspace compatibility and publish git changes

**Files:**
- Modify: none expected

**Step 1: Run targeted verification**

Run:
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-agents/src/services/AgentSdkService.test.ts`
- `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-agents/src/services/AgentService.test.ts`
- `pnpm.cmd --filter @sdkwork/react-mobile-agents build`

Expected: PASS

**Step 2: Run workspace verification**

Run:
- `pnpm.cmd run build`
- `pnpm.cmd run validate:standards`
- `pnpm.cmd run check:sdk-standard`

Expected: PASS with only the known baseline warnings already accepted in the repo.

**Step 3: Commit**

```bash
git add packages/sdkwork-react-mobile-agents docs/plans/2026-03-16-mobile-agents-sdk-integration-*.md
git commit -m "add mobile agents sdk integration"
git push origin main
```
