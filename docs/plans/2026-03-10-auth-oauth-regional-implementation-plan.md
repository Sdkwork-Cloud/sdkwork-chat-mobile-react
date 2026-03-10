# Regional OAuth Login Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a market-aware OAuth login system for domestic and international variants with a standard provider registry, callback route, and provider-specific flow handling.

**Architecture:** The auth package will expose a provider registry and market resolver. `LoginPage` will render provider cards from that registry. `appAuthService` will execute popup, redirect, or native-compatible flows based on provider metadata and the current runtime. The app router will add `/auth/callback` to complete redirect-based OAuth login.

**Tech Stack:** React, TypeScript, Zustand, Vite, Vitest, existing `@sdkwork/app-sdk` auth APIs

---

### Task 1: Document the provider protocol surface

**Files:**
- Create: `packages/sdkwork-react-mobile-auth/src/oauth/oauthTypes.ts`
- Modify: `packages/sdkwork-react-mobile-auth/src/types/index.ts`

**Step 1: Write the failing test**

Create a contract test that expects:
- a market type with `cn | global | auto`
- provider ids including `qq`
- an interaction mode enum that includes `popup`, `redirect`, and `native`

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm.cmd exec vitest run packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts
```

Expected: FAIL because the oauth type module does not exist.

**Step 3: Write minimal implementation**

Add the typed oauth domain types and extend the auth social provider union with
`qq`.

**Step 4: Run test to verify it passes**

Run the same command and expect PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-auth/src/oauth/oauthTypes.ts packages/sdkwork-react-mobile-auth/src/types/index.ts packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts
git commit -m "feat(auth): add oauth provider protocol types"
```

### Task 2: Add market resolution and provider registry

**Files:**
- Create: `packages/sdkwork-react-mobile-auth/src/oauth/authMarket.ts`
- Create: `packages/sdkwork-react-mobile-auth/src/oauth/oauthProviders.ts`
- Test: `packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts`

**Step 1: Write the failing test**

Add tests that expect:
- `zh-CN` resolves to `cn`
- `en-US` resolves to `global`
- domestic market includes `wechat` and `qq`
- international market excludes `wechat` and `qq`
- provider order is stable

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm.cmd exec vitest run packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts
```

Expected: FAIL with missing exports or incorrect provider lists.

**Step 3: Write minimal implementation**

Implement market resolution helpers and a provider registry with market-aware
filtering.

**Step 4: Run test to verify it passes**

Run the same command and expect PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-auth/src/oauth/authMarket.ts packages/sdkwork-react-mobile-auth/src/oauth/oauthProviders.ts packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts
git commit -m "feat(auth): add regional oauth provider registry"
```

### Task 3: Add redirect callback validation and flow execution helpers

**Files:**
- Create: `packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.ts`
- Test: `packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts`
- Modify: `packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts`

**Step 1: Write the failing test**

Add tests that expect:
- web desktop Google prefers popup
- web WeChat prefers redirect
- callback parser rejects missing provider
- callback parser rejects missing code when no error is present

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm.cmd exec vitest run packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts
```

Expected: FAIL because flow helpers are missing.

**Step 3: Write minimal implementation**

Implement:
- runtime-aware interaction mode selection
- callback query parsing
- service integration for `qq`
- redirect flow path using `/auth/callback`

**Step 4: Run test to verify it passes**

Run the same command and expect PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.ts packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts
git commit -m "feat(auth): support market-aware oauth flow execution"
```

### Task 4: Rebuild the login page around the provider registry

**Files:**
- Modify: `packages/sdkwork-react-mobile-auth/src/pages/LoginPage.tsx`
- Modify: `src/router/index.tsx`
- Modify: `src/router/paths.ts`
- Test: `packages/sdkwork-react-mobile-auth/src/pages/LoginPage.providerDeck.test.tsx`

**Step 1: Write the failing test**

Add tests that expect:
- domestic market renders WeChat and QQ
- international market renders Google and Apple
- provider deck labels are data-driven instead of hardcoded

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm.cmd exec vitest run packages/sdkwork-react-mobile-auth/src/pages/LoginPage.providerDeck.test.tsx
```

Expected: FAIL because login page still hardcodes providers.

**Step 3: Write minimal implementation**

Make the login page:
- accept optional `market` and `locale`
- resolve current market
- render provider cards from the registry
- show provider-specific helper copy

Update router props to pass `locale`.

**Step 4: Run test to verify it passes**

Run the same command and expect PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-auth/src/pages/LoginPage.tsx packages/sdkwork-react-mobile-auth/src/pages/LoginPage.providerDeck.test.tsx src/router/index.tsx src/router/paths.ts
git commit -m "feat(auth): render regional oauth provider deck"
```

### Task 5: Add OAuth callback page and route integration

**Files:**
- Create: `packages/sdkwork-react-mobile-auth/src/pages/OAuthCallbackPage.tsx`
- Modify: `packages/sdkwork-react-mobile-auth/src/pages/index.ts`
- Modify: `packages/sdkwork-react-mobile-auth/src/index.ts`
- Modify: `src/router/index.tsx`
- Modify: `src/router/paths.ts`
- Test: `packages/sdkwork-react-mobile-auth/src/pages/OAuthCallbackPage.test.tsx`
- Test: `src/app/shell/navigation.coverage.test.ts`

**Step 1: Write the failing test**

Add tests that expect:
- `/auth/callback` is registered as a public route
- callback page handles success params
- callback page handles protocol errors

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm.cmd exec vitest run packages/sdkwork-react-mobile-auth/src/pages/OAuthCallbackPage.test.tsx src/app/shell/navigation.coverage.test.ts
```

Expected: FAIL because callback page and route do not exist.

**Step 3: Write minimal implementation**

Implement the callback page and wire it into the router as a public route.

**Step 4: Run test to verify it passes**

Run the same command and expect PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-auth/src/pages/OAuthCallbackPage.tsx packages/sdkwork-react-mobile-auth/src/pages/index.ts packages/sdkwork-react-mobile-auth/src/index.ts src/router/index.tsx src/router/paths.ts src/app/shell/navigation.coverage.test.ts packages/sdkwork-react-mobile-auth/src/pages/OAuthCallbackPage.test.tsx
git commit -m "feat(auth): add oauth callback route"
```

### Task 6: Add locale copy and full verification

**Files:**
- Modify: `src/core/i18n/locales/en-US/auth.ts`
- Modify: `src/core/i18n/locales/zh-CN/auth.ts`
- Create: `src/core/i18n/locales/authOauthLocale.test.ts`

**Step 1: Write the failing test**

Add locale coverage expectations for:
- regional provider section titles
- provider descriptions
- callback error copy

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm.cmd exec vitest run src/core/i18n/locales/authOauthLocale.test.ts
```

Expected: FAIL because new locale keys do not exist.

**Step 3: Write minimal implementation**

Add the new copy to both locale files and keep the auth page copy coherent.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm.cmd exec vitest run packages/sdkwork-react-mobile-auth/src/oauth/oauthFlow.contract.test.ts packages/sdkwork-react-mobile-auth/src/pages/LoginPage.providerDeck.test.tsx packages/sdkwork-react-mobile-auth/src/pages/OAuthCallbackPage.test.tsx src/core/i18n/locales/authOauthLocale.test.ts src/app/shell/navigation.coverage.test.ts
```

Expected: PASS

Then run:

```bash
pnpm.cmd exec vite build --mode development
```

Expected: build succeeds

**Step 5: Commit**

```bash
git add src/core/i18n/locales/en-US/auth.ts src/core/i18n/locales/zh-CN/auth.ts src/core/i18n/locales/authOauthLocale.test.ts
git commit -m "feat(auth): polish regional oauth login copy"
```
