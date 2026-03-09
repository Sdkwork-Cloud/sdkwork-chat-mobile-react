# Commerce Deep Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the commerce deep workflow pages so gig fulfillment and order management feel like polished mobile work surfaces, while keeping current route and service behavior intact.

**Architecture:** Preserve existing hooks, services, route signatures, and callbacks. Limit the iteration to page composition, CSS, and locale coverage for `MyGigsPage`, `OrderListPage`, and `OrderDetailPage`, plus regression tests that lock the new source-level contracts.

**Tech Stack:** TypeScript, React, module-local CSS, Vitest, Vite

---

### Task 1: Lock the deep workflow structure with failing tests

**Files:**
- Create: `packages/sdkwork-react-mobile-commerce/src/pages/CommerceDeepPages.contract.test.ts`
- Modify: `src/core/i18n/locales/driveGigWorkbenchLocale.test.ts`

**Step 1: Write the failing test**

Add expectations for:

- `MyGigsPage` hero shell, workbench metrics, tabbar shell, command sheet sections, and clean fallback strings
- `OrderListPage` hero shell, workbench metrics, queue tabbar, decision surfaces, and action deck structure
- `OrderDetailPage` status board, progress section, logistics/product/amount surfaces, and footer command row
- newly introduced deep-workflow locale keys in `en-US` and `zh-CN`

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-commerce/src/pages/CommerceDeepPages.contract.test.ts src/core/i18n/locales/driveGigWorkbenchLocale.test.ts`

Expected: FAIL because the new structure and locale keys do not exist yet.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement the `MyGigsPage` workbench refinement

**Files:**
- Modify: `packages/sdkwork-react-mobile-commerce/src/pages/MyGigsPage.tsx`
- Create: `packages/sdkwork-react-mobile-commerce/src/pages/MyGigsPage.css`

**Step 1: Write minimal implementation**

Implement:

- hero card and summary metrics
- stronger tabbar treatment for active/history
- upgraded task cards with clearer metadata and CTA priority
- structured popup command sheet

Keep `gigService`, existing submit/settle actions, and the popup interaction model intact.

**Step 2: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-commerce/src/pages/CommerceDeepPages.contract.test.ts`

Expected: partial PASS on `MyGigsPage` assertions, with remaining failures for other pages or locale keys still expected.

**Step 3: Commit**

Skip commit in this session.

### Task 3: Implement the `OrderListPage` queue-center refinement

**Files:**
- Modify: `packages/sdkwork-react-mobile-commerce/src/pages/OrderListPage.tsx`
- Modify: `packages/sdkwork-react-mobile-commerce/src/pages/OrderListPage.css`

**Step 1: Write minimal implementation**

Implement:

- hero queue summary
- metric deck
- stronger status tabbar shell
- richer order cards with clearer progress, amount, and CTA grouping

Keep `useOrders`, `onOrderClick`, and the existing action callbacks unchanged.

**Step 2: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-commerce/src/pages/CommerceDeepPages.contract.test.ts`

Expected: all `MyGigsPage` and `OrderListPage` assertions pass, with any remaining `OrderDetailPage` and locale failures still expected.

**Step 3: Commit**

Skip commit in this session.

### Task 4: Implement the `OrderDetailPage` fulfillment-console refinement

**Files:**
- Modify: `packages/sdkwork-react-mobile-commerce/src/pages/OrderDetailPage.tsx`
- Modify: `packages/sdkwork-react-mobile-commerce/src/pages/OrderDetailPage.css`

**Step 1: Write minimal implementation**

Implement:

- richer status board
- progress/journey section
- clearer logistics, product, amount, and overview surfaces
- refined footer command row

Keep `useOrders`, `loadOrder`, and all existing order actions unchanged.

**Step 2: Run page contract test**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-commerce/src/pages/CommerceDeepPages.contract.test.ts`

Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 5: Repair locale coverage and verify in context

**Files:**
- Modify: `src/core/i18n/locales/en-US/commerce.ts`
- Modify: `src/core/i18n/locales/zh-CN/commerce.ts`
- Modify: `src/core/i18n/locales/driveGigWorkbenchLocale.test.ts`

**Step 1: Write minimal implementation**

Add or rewrite only the gig/order workflow keys required by the refined pages, keeping unrelated commerce locale areas untouched.

**Step 2: Run related regressions**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-commerce/src/pages/CommerceDeepPages.contract.test.ts packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts packages/sdkwork-react-mobile-commerce/src/services/CommerceServicesSdkMode.test.ts src/core/i18n/locales/driveGigWorkbenchLocale.test.ts`

Expected: PASS

**Step 3: Run development build**

Run: `pnpm.cmd exec vite build --mode development`

Expected: PASS, with only known pre-existing warnings if any.

**Step 4: Commit**

Skip commit in this session.
