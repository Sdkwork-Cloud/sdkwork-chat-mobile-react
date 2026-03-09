# Email Detail Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade `EmailThreadPage` and `EmailComposePage` so the detail and drafting flows match the Gmail-style Email workbench homepage.

**Architecture:** Preserve the current route contracts, workspace hook usage, inline feedback timing, local draft persistence, discard protection, and `onReply` / `onSend` callbacks. Restrict this pass to component composition, CSS, and any new locale keys needed by the richer shells.

**Tech Stack:** TypeScript, React, module-local CSS, Vitest, Vite

---

### Task 1: Lock the Email detail-page structure with failing tests

**Files:**
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailRoutePages.contract.test.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write the failing test**

Add assertions for:
- thread command shell
- thread hero summary card
- thread conversation surface and improved empty state
- compose command shell
- compose draft workspace card
- grouped editor surfaces for recipient, subject, and body
- any new locale keys introduced for these shells

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-email/src/pages/EmailRoutePages.contract.test.ts src/core/i18n/locales/emailNotesLocale.test.ts`
Expected: FAIL because the upgraded structure and locale keys do not exist yet.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement the upgraded thread page

**Files:**
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailThreadPage.tsx`
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailThreadPage.css`

**Step 1: Write minimal implementation**

Implement:
- command-shell header with title cluster and reply action
- integrated feedback presentation
- hero summary card with thread metadata
- conversation surface and action row
- stronger empty state

**Step 2: Run Email route page test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-email/src/pages/EmailRoutePages.contract.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 3: Implement the upgraded compose page

**Files:**
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailComposePage.tsx`
- Modify: `packages/sdkwork-react-mobile-email/src/pages/EmailComposePage.css`

**Step 1: Write minimal implementation**

Implement:
- command-shell header aligned with the Email workbench
- draft workspace card with reply/new-draft context
- richer reply hint surface
- grouped editor cards for recipient, subject, and body
- stronger primary send action styling

**Step 2: Run Email route page test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-email/src/pages/EmailRoutePages.contract.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 4: Add locale coverage and verify in context

**Files:**
- Modify: `src/core/i18n/locales/en-US/email.ts`
- Modify: `src/core/i18n/locales/zh-CN/email.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write minimal implementation**

Add any new Email detail-page labels needed by the upgraded thread and compose shells.

**Step 2: Run related regressions**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-email/src/pages/EmailRoutePages.contract.test.ts packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts packages/sdkwork-react-mobile-notes/src/pages/NotesRoutePages.contract.test.ts packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts src/core/i18n/locales/emailNotesLocale.test.ts packages/sdkwork-react-mobile-discover/src/pages/DiscoverPage.product.test.ts packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts`
Expected: PASS

**Step 3: Run development build**

Run: `pnpm.cmd exec vite build --mode development`
Expected: PASS, with only known pre-existing warnings if any.

**Step 4: Commit**

Skip commit in this session.
