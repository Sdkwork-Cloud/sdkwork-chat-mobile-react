# Auth User SDK Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a stable SDK-driven `auth + user` foundation in `sdkwork-chat-mobile-react` using `@sdkwork/app-sdk`, while explicitly keeping chat out of scope for a future dedicated chat SDK.

**Architecture:** The implementation keeps SDK client/session mechanics in `react-mobile-core`, domain orchestration in `react-mobile-auth` and `react-mobile-user`, and UI state in stores consumed by pages. Remote auth/user data becomes authoritative, while local storage is limited to token persistence and startup recovery.

**Tech Stack:** React, TypeScript, Vite, pnpm workspace, Zustand-style store patterns already present in the repo, `@sdkwork/app-sdk`, Capacitor-compatible storage/runtime helpers, Vitest.

---

### Task 1: Inventory Existing Auth and User Entry Points

**Files:**
- Inspect: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-core/src/sdk/appSdkClient.ts`
- Inspect: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts`
- Inspect: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/`
- Inspect: `apps/sdkwork-chat-mobile-react/src/`

**Step 1: Find current auth and user stores/pages**

Run:

```bash
rg -n "login|register|profile|currentUser|restoreSession|auth store|user store" apps/sdkwork-chat-mobile-react/packages apps/sdkwork-chat-mobile-react/src
```

Expected: references to current auth entry points, current user access points, and pages consuming them.

**Step 2: Write a short inventory note**

Create a local working note listing:

- current auth store locations
- current user store/service locations
- app bootstrap file that should trigger session restore
- pages to migrate to the new store/service path

**Step 3: Commit**

```bash
git add .
git commit -m "chore: inventory auth and user integration points"
```

### Task 2: Add Failing Tests for Core Session Helpers

**Files:**
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-core/src/sdk/authSession.test.ts`
- Modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-core/src/sdk/appSdkClient.ts`

**Step 1: Write the failing test**

Cover these behaviors:

- persisted tokens can be read from storage
- `apply...SessionTokens` normalizes bearer prefix
- invalid/missing tokens produce empty normalized values

Use the project test style already present in core package tests.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-core test:run -- authSession
```

Expected: FAIL because helper behavior is missing or not isolated enough to test cleanly.

**Step 3: Write minimal implementation**

Extract or add explicit helpers in `appSdkClient.ts` or a nearby `authSession.ts` file for:

- reading token bundle from storage
- writing token bundle
- clearing token bundle
- applying normalized tokens to SDK client

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-core test:run -- authSession
```

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-core/src/sdk
git commit -m "feat: add core auth session helpers"
```

### Task 3: Add Failing Tests for User DTO Mapping

**Files:**
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-core/src/sdk/userMappers.test.ts`
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-core/src/sdk/userMappers.ts`

**Step 1: Write the failing test**

Test mapping from SDK user/profile DTO shapes to a stable app-facing model with:

- id
- username
- displayName
- avatarUrl
- email
- phone

Include one sparse DTO case and one complete DTO case.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-core test:run -- userMappers
```

Expected: FAIL because the mapper file does not yet exist.

**Step 3: Write minimal implementation**

Implement a mapper that:

- accepts current SDK DTO variants used by auth/profile flows
- returns a consistent app-facing user model
- uses safe fallbacks for missing nickname/avatar fields

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-core test:run -- userMappers
```

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-core/src/sdk
git commit -m "feat: add user dto mappers"
```

### Task 4: Add Failing Tests for Auth Service Session Restore

**Files:**
- Modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts`
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth/src/services/appAuthService.test.ts`

**Step 1: Write the failing test**

Cover:

- restore succeeds when persisted tokens are valid and profile fetch succeeds
- restore clears session when profile fetch fails with invalid auth semantics
- logout clears persisted tokens even if remote logout throws

Mock the SDK client boundary, not the internal business logic.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-auth test:run -- appAuthService
```

Expected: FAIL because restore behavior is missing or incomplete.

**Step 3: Write minimal implementation**

Add or refine methods in `appAuthService.ts` for:

- `restoreSession()`
- token invalidation cleanup path
- consistent logout cleanup path

Keep current login/register behavior intact unless needed for consistency.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-auth test:run -- appAuthService
```

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth/src/services
git commit -m "feat: add auth session restore flow"
```

### Task 5: Add Auth Store Tests and Implement Store State Model

**Files:**
- Create or modify store files under: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth/src/`
- Create tests near the store file(s)

**Step 1: Write the failing test**

Test store state transitions for:

- initial idle state
- restoring state
- authenticated state after login/restore
- logged-out state after logout
- error state after restore failure

**Step 2: Run test to verify it fails**

Run the auth package tests targeted to the store file.

Expected: FAIL because the target state machine does not yet exist or match the desired contract.

**Step 3: Write minimal implementation**

Implement store actions:

- `initializeAuth()`
- `login()`
- `logout()`
- `refreshSession()`
- selectors for auth status and session identity

**Step 4: Run test to verify it passes**

Run the same targeted test command.

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth/src
git commit -m "feat: add auth store state flow"
```

### Task 6: Add Failing Tests for User Service

**Files:**
- Create or modify: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/services/appUserService.ts`
- Create: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/services/appUserService.test.ts`

**Step 1: Write the failing test**

Cover:

- fetching current profile returns mapped user model
- updating profile returns refreshed mapped user model
- service classifies SDK failures into app-facing error categories

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-user test:run -- appUserService
```

Expected: FAIL because service behavior is missing or incomplete.

**Step 3: Write minimal implementation**

Implement:

- `getCurrentProfile()`
- `updateCurrentProfile()`
- lightweight error classification helper

Reuse the core user mapper instead of duplicating field logic.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter @sdkwork/react-mobile-user test:run -- appUserService
```

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/services
git commit -m "feat: add user profile service"
```

### Task 7: Add User Store Tests and Implement Current User Store

**Files:**
- Create or modify store files under: `apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/`
- Create tests near the store file(s)

**Step 1: Write the failing test**

Cover:

- empty initial state
- successful `ensureCurrentUser()`
- state replacement after profile update
- clearing user state on logout event or auth reset

**Step 2: Run test to verify it fails**

Run the user package targeted test command.

Expected: FAIL because the store contract is not yet complete.

**Step 3: Write minimal implementation**

Implement:

- `ensureCurrentUser()`
- `refreshCurrentUser()`
- `updateCurrentUser()`
- `clearCurrentUser()`

Use the user service as the only remote dependency.

**Step 4: Run test to verify it passes**

Run the same targeted test command.

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src
git commit -m "feat: add current user store"
```

### Task 8: Wire App Startup to Session Restore

**Files:**
- Modify: app bootstrap file(s) under `apps/sdkwork-chat-mobile-react/src/`
- Modify: relevant root provider/composition files
- Test: add or update a lightweight bootstrap/init test if the repo already has one nearby

**Step 1: Write the failing test**

Add a test or minimal integration check showing that app initialization invokes auth restore once.

**Step 2: Run test to verify it fails**

Run the targeted test command for the bootstrap/root module.

Expected: FAIL because startup restore is not wired or not observable.

**Step 3: Write minimal implementation**

Wire auth initialization on app startup with:

- one initialization path
- no repeated restore loops
- safe loading state during startup

**Step 4: Run test to verify it passes**

Run the same targeted test command.

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/src apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth
git commit -m "feat: restore auth session on app startup"
```

### Task 9: Migrate Login and Profile Screens to Store-Driven Flows

**Files:**
- Modify login/register screens under `apps/sdkwork-chat-mobile-react/src/` or package pages
- Modify profile/account screens under user package or app shell routes
- Add or update targeted component/page tests where practical

**Step 1: Write the failing test**

Choose one login screen test and one profile page test that demonstrate:

- form submit uses store action
- successful result updates rendered UI

**Step 2: Run test to verify it fails**

Run the targeted page/component tests.

Expected: FAIL because the screens still depend on old flows.

**Step 3: Write minimal implementation**

Update screens so they:

- consume auth/user stores
- stop importing SDK client or low-level token logic directly
- render loading/error states from store state

**Step 4: Run test to verify it passes**

Run the same targeted tests.

Expected: PASS

**Step 5: Commit**

```bash
git add apps/sdkwork-chat-mobile-react/src apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user apps/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-auth
git commit -m "feat: migrate auth and profile screens to sdk stores"
```

### Task 10: Run Final Verification

**Files:**
- No new files required

**Step 1: Run auth package tests**

```bash
pnpm --filter @sdkwork/react-mobile-auth test:run
```

Expected: PASS

**Step 2: Run user package tests**

```bash
pnpm --filter @sdkwork/react-mobile-user test:run
```

Expected: PASS

**Step 3: Run core package tests**

```bash
pnpm --filter @sdkwork/react-mobile-core test:run
```

Expected: PASS

**Step 4: Run workspace typecheck**

```bash
pnpm run typecheck
```

Expected: PASS

**Step 5: Run workspace build**

```bash
pnpm run build
```

Expected: PASS

**Step 6: Commit final verification-safe state**

```bash
git add .
git commit -m "feat: complete auth and user sdk integration"
```

