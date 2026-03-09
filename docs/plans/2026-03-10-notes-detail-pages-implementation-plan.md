# Notes Detail Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade `NotesDocPage` and `NotesCreatePage` into visually consistent detail/drafting surfaces that match the Notes workbench homepage.

**Architecture:** Preserve all existing route contracts, workspace hooks, feedback timing, draft persistence, and create/edit callbacks. Restrict this iteration to page composition, CSS, and any new locale keys required by the richer page shells.

**Tech Stack:** TypeScript, React, module-local CSS, Vitest, Vite

---

### Task 1: Lock the detail/create page product structure with failing tests

**Files:**
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesRoutePages.contract.test.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write the failing test**

Add assertions for:
- command-shell doc page
- document hero card and reading surface
- command-shell create page
- draft workspace card and editorial form shell
- any new locale keys needed for the upgraded Notes detail pages

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-notes/src/pages/NotesRoutePages.contract.test.ts src/core/i18n/locales/emailNotesLocale.test.ts`
Expected: FAIL because the new structure and locale keys do not exist yet.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement the upgraded Notes detail page

**Files:**
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesDocPage.tsx`
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesDocPage.css`

**Step 1: Write minimal implementation**

Implement:
- command shell header
- document hero card
- stronger metadata presentation
- integrated feedback styling
- reading surface and improved empty state

**Step 2: Run Notes route page test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-notes/src/pages/NotesRoutePages.contract.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 3: Implement the upgraded Notes create page

**Files:**
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesCreatePage.tsx`
- Modify: `packages/sdkwork-react-mobile-notes/src/pages/NotesCreatePage.css`

**Step 1: Write minimal implementation**

Implement:
- command shell header
- drafting workspace intro card
- template/source hint as part of the editing surface
- richer title/content editor cards
- save CTA styling aligned with the Notes module

**Step 2: Run Notes route page test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-notes/src/pages/NotesRoutePages.contract.test.ts`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 4: Add locale coverage and verify in context

**Files:**
- Modify: `src/core/i18n/locales/en-US/notes.ts`
- Modify: `src/core/i18n/locales/zh-CN/notes.ts`
- Modify: `src/core/i18n/locales/emailNotesLocale.test.ts`

**Step 1: Write minimal implementation**

Add any new labels needed by the updated detail/create pages.

**Step 2: Run related regressions**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-notes/src/pages/NotesRoutePages.contract.test.ts packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts src/core/i18n/locales/emailNotesLocale.test.ts packages/sdkwork-react-mobile-email/src/pages/EmailPage.tabbar.test.ts packages/sdkwork-react-mobile-discover/src/pages/DiscoverPage.product.test.ts packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tabbar.test.ts packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tabbar.test.ts`
Expected: PASS

**Step 3: Run development build**

Run: `pnpm.cmd exec vite build --mode development`
Expected: PASS, with only known pre-existing warnings if any.

**Step 4: Commit**

Skip commit in this session.
