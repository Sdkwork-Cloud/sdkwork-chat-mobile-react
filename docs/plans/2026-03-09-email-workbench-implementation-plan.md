# Email Workbench Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the mobile email home page into a Gmail-style workbench with a stronger inbox-first layout, clearer tabbar behavior, and productized overview copy.

**Architecture:** Keep the existing module routes and email workspace controller intact. Limit this iteration to `EmailPage.tsx`, `EmailPage.css`, and root locale resources, with tests that lock the product structure and new copy keys before implementation.

**Tech Stack:** TypeScript, React, module-local CSS, Vitest, Vite

---

### Task 1: Lock the product contract with failing tests

**Files:**
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write the failing test**

Add assertions for:
- Gmail-style workbench affordances in `EmailPage.tsx`
- Search-style header shell
- Workbench hero metrics
- Priority section / spaces section structure
- New email locale keys for workbench copy

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts src/core/i18n/locales/emailNotesLocale.test.ts`
Expected: FAIL because the new structure and locale keys do not exist yet.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement the Email workbench

**Files:**
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailPage.tsx`
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailPage.css`

**Step 1: Write minimal implementation**

Implement:
- Gmail-style header with search/workspace affordance
- Inbox-first hero with focused summary metrics
- Workbench quick actions
- Priority inbox section
- Shared spaces section that remains reachable from tabbar
- Empty states that match the upgraded page structure

**Step 2: Run focused test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 3: Add locale coverage for the Email workbench

**Files:**
- Modify: `src/core/i18n/locales/en-US/email.ts`
- Modify: `src/core/i18n/locales/zh-CN/email.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write minimal implementation**

Add the new email workbench copy keys in both locales with stable English and Chinese copy.

**Step 2: Run locale test to verify it passes**

Run: `pnpm.cmd exec vitest run src/core/i18n/locales/emailNotesLocale.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 4: Verify the Email workbench in context

**Files:**
- Test: `packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts`
- Test: `src/core/i18n/locales/emailNotesLocale.test.ts`
- Test: `packages/sdkwork-react-mobile-discover/src/pages/DiscoverPage.product.test.ts`
- Test: `packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts`
- Test: `packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts`

**Step 1: Run related regression tests**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts src/core/i18n/locales/emailNotesLocale.test.ts packages/sdkwork-react-mobile-discover/src/pages/DiscoverPage.product.test.ts packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts`
Expected: PASS

**Step 2: Run development build**

Run: `pnpm.cmd exec vite build --mode development`
Expected: PASS, with only known pre-existing warnings if any.

**Step 3: Commit**

Skip commit in this session.
