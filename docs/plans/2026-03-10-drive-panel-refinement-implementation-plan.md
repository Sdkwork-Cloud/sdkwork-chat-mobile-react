# Drive Panel Refinement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the five existing Drive tab panels so they read like a professional cloud-drive mobile workbench without changing routes or storage behavior.

**Architecture:** Preserve the current `CloudDrivePage` single-page tabbar architecture, store hooks, upload queue logic, filters, breadcrumb flow, and storage calculations. Limit this iteration to new panel composition, CSS, and any new locale keys needed by the refined surfaces.

**Tech Stack:** TypeScript, React, module-local CSS, Vitest, Vite

---

### Task 1: Lock the refined Drive panel structure with failing tests

**Files:**
- Modify: `packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts`
- Modify: `src/core/i18n/locales/driveGigWorkbenchLocale.test.ts`

**Step 1: Write the failing test**

Add assertions for:
- files spotlight strip
- recent focus card
- transfer operations board
- category spotlight/leader strip
- storage reclaim/advisor section
- any new Drive locale keys introduced for these surfaces

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts src/core/i18n/locales/driveGigWorkbenchLocale.test.ts`
Expected: FAIL because the new structure and locale keys do not exist yet.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement the refined Drive panel surfaces

**Files:**
- Modify: `packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tsx`
- Modify: `packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.css`

**Step 1: Write minimal implementation**

Implement:
- files spotlight summary strip
- recent focus card
- transfer operations board
- category spotlight/leader strip
- storage reclaim/advisor section

Keep all current interactions, queue behavior, filters, and tab switching intact.

**Step 2: Run Drive panel test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 3: Add locale coverage and verify in context

**Files:**
- Modify: `src/core/i18n/locales/en-US/drive.ts`
- Modify: `src/core/i18n/locales/zh-CN/drive.ts`
- Modify: `src/core/i18n/locales/driveGigWorkbenchLocale.test.ts`

**Step 1: Write minimal implementation**

Add any new Drive labels needed by the refined panel surfaces.

**Step 2: Run related regressions**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts packages/sdkwork-react-mobile-drive/src/pages/drivePrimaryTabs.test.ts packages/sdkwork-react-mobile-drive/src/pages/driveTransferQueue.test.ts src/core/i18n/locales/driveGigWorkbenchLocale.test.ts packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts packages/sdkwork-react-mobile-discover/src/pages/DiscoverPage.product.test.ts`
Expected: PASS

**Step 3: Run development build**

Run: `pnpm.cmd exec vite build --mode development`
Expected: PASS, with only known pre-existing warnings if any.

**Step 4: Commit**

Skip commit in this session.
