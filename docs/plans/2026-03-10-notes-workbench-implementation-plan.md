# Notes Workbench Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the mobile Notes home page into a Notion-style collaboration workbench with stronger workspace context, quick actions, preview lanes, and a refined tabbar experience.

**Architecture:** Keep the existing notes service and workspace controller unchanged. Limit the iteration to `NotesPage`, its CSS, and root locale coverage, using source-level tests to lock the product structure before implementation.

**Tech Stack:** TypeScript, React, module-local CSS, Vitest, Vite

---

### Task 1: Lock the Notes workbench contract with failing tests

**Files:**
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write the failing test**

Add assertions for:
- command-shell Notes header
- workspace panel and spotlight grid
- quick actions and knowledge strip
- upgraded active panel structure
- new Notes workbench locale keys

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts src/core/i18n/locales/emailNotesLocale.test.ts`
Expected: FAIL because the new Notes workbench structure and locale keys do not exist yet.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement the Notes workbench shell

**Files:**
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tsx`
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesPage.css`

**Step 1: Write minimal implementation**

Implement:
- command-shell header
- workspace panel with title, subtitle, badge, and quick create
- metric / spotlight cards
- quick actions row
- knowledge strip preview area
- improved active tab panels for docs, tasks, wiki, and activity
- preserved bottom tabbar

**Step 2: Run Notes page test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 3: Add Notes workbench locale coverage

**Files:**
- Modify: `src/core/i18n/locales/en-US/notes.ts`
- Modify: `src/core/i18n/locales/zh-CN/notes.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write minimal implementation**

Add new Notes workbench copy keys in both locales.

**Step 2: Run locale test to verify it passes**

Run: `pnpm.cmd exec vitest run src/core/i18n/locales/emailNotesLocale.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 4: Verify the Notes workbench in context

**Files:**
- Test: `packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts`
- Test: `src/core/i18n/locales/emailNotesLocale.test.ts`
- Test: `packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts`
- Test: `packages/sdkwork-react-mobile-discover/src/pages/DiscoverPage.product.test.ts`
- Test: `packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts`
- Test: `packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts`

**Step 1: Run related regression tests**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts src/core/i18n/locales/emailNotesLocale.test.ts packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts packages/sdkwork-react-mobile-discover/src/pages/DiscoverPage.product.test.ts packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts`
Expected: PASS

**Step 2: Run development build**

Run: `pnpm.cmd exec vite build --mode development`
Expected: PASS, with only known pre-existing warnings if any.

**Step 3: Commit**

Skip commit in this session.
