# Mobile IM SDK Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared IM SDK bridge so auth stays on app-sdk while IM, realtime, and RTC use the composed IM SDK.

**Architecture:** A core-level IM runtime owns the IM backend client, IM SDK singleton, app-auth session sync, realtime bootstrap, and connection-state tracking. Auth service drives the bridge lifecycle, and RTC-facing feature code consumes the bridge instead of assembling SDK instances locally.

**Tech Stack:** TypeScript, React, Vitest, Vite, `@sdkwork/app-sdk`, `@openchat/sdkwork-im-sdk`, WuKongIM adapter

---

### Task 1: Add Core IM Bridge Tests

**Files:**
- Test: `packages/sdkwork-react-mobile-core/tests/imSdkClient.test.ts`

- [ ] Step 1: Write failing tests for runtime config, session sync, and clear flow
- [ ] Step 2: Run `pnpm exec vitest run packages/sdkwork-react-mobile-core/tests/imSdkClient.test.ts`
- [ ] Step 3: Confirm failure is caused by missing IM bridge module

### Task 2: Implement Core IM Bridge

**Files:**
- Create: `packages/sdkwork-react-mobile-core/src/sdk/imSdkClient.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/index.ts`
- Modify: `packages/sdkwork-react-mobile-core/tsconfig.json`
- Modify: `packages/sdkwork-react-mobile-core/vite.config.ts`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`
- Modify: `package.json`

- [ ] Step 1: Add source aliases and runtime dependency needed by the IM adapter
- [ ] Step 2: Implement IM runtime config and client creation against `VITE_IM_API_BASE_URL`
- [ ] Step 3: Implement app-auth session sync, realtime bootstrap, connection tracking, and clear/reset helpers
- [ ] Step 4: Export the bridge from core
- [ ] Step 5: Re-run `pnpm exec vitest run packages/sdkwork-react-mobile-core/tests/imSdkClient.test.ts`

### Task 3: Bind Auth Lifecycle To IM Bridge

**Files:**
- Modify: `packages/sdkwork-react-mobile-auth/src/services/AppAuthService.ts`
- Modify: `packages/sdkwork-react-mobile-auth/src/services/AppAuthService.test.ts`

- [ ] Step 1: Keep login on app-sdk and add failing expectations for IM sync/clear
- [ ] Step 2: Sync IM bridge on login, restore, refresh, and social login
- [ ] Step 3: Clear IM bridge on invalid restore and logout
- [ ] Step 4: Re-run `pnpm exec vitest run packages/sdkwork-react-mobile-auth/src/services/AppAuthService.test.ts`

### Task 4: Migrate RTC Consumer To Core Bridge

**Files:**
- Modify: `packages/sdkwork-react-mobile-communication/src/services/CallService.ts`
- Create: `packages/sdkwork-react-mobile-communication/src/services/CallService.test.ts`

- [ ] Step 1: Write failing tests for IM RTC record preference and local fallback
- [ ] Step 2: Implement remote RTC record loading through the core IM bridge
- [ ] Step 3: Preserve local fallback for demo data and unsupported paths
- [ ] Step 4: Run targeted call service tests

### Task 5: Verify And Rescan

**Files:**
- Review: `packages/sdkwork-react-mobile-core/src/sdk/imSdkClient.ts`
- Review: `packages/sdkwork-react-mobile-auth/src/services/AppAuthService.ts`
- Review: `packages/sdkwork-react-mobile-communication/src/services/CallService.ts`

- [ ] Step 1: Run targeted tests for core, auth, and communication
- [ ] Step 2: Run `pnpm typecheck`
- [ ] Step 3: Run `pnpm build`
- [ ] Step 4: Rescan chat/communication/auth for remaining raw IM or RTC bypasses
