# Tabbar Icon Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the global shell tabbar so it uses borderless IM-style glyph icons, active tabs use filled variants, inactive tabs use outline variants, and the second tab becomes a lobster icon without changing routing behavior.

**Architecture:** Keep the existing `APP_TABS`, active-path resolution, click guard, and reselect behavior intact. Limit this change to the tabbar presentation layer by adding render-focused regression coverage first, then replacing the current framed icon treatment with a pure glyph set and lighter CSS.

**Tech Stack:** TypeScript, React, CSS, Vitest, React DOM server, Vite

---

### Task 1: Lock the visual tab state with a failing render test

**Files:**
- Create: `src/components/Tabbar/Tabbar.render.test.tsx`
- Modify: `src/components/Tabbar/Tabbar.navigation.test.tsx`

**Step 1: Write the failing test**

Create a render test that:
- sets the current path to one known tab root
- renders `Tabbar`
- asserts the active tab exposes a filled icon variant marker
- asserts an inactive tab exposes an outline icon variant marker
- asserts the second tab exposes a lobster icon marker
- asserts no active indicator element is rendered
- asserts the chat badge still renders when unread count exists

Use lightweight dependency mocks for:
- `../../stores/chatStore`
- `../../core/i18n/I18nContext`
- `../../platform`
- `../../router`

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run src/components/Tabbar/Tabbar.render.test.tsx src/components/Tabbar/Tabbar.navigation.test.tsx`
Expected: FAIL because the current tabbar markup still uses the previous framed icon treatment and does not expose the lobster marker or indicator removal expectation.

**Step 3: Commit**

Skip commit in this session.

### Task 2: Implement borderless paired tab icons

**Files:**
- Create: `src/components/Tabbar/tabbarIcons.tsx`
- Modify: `src/components/Tabbar/Tabbar.tsx`

**Step 1: Write minimal implementation**

Implement a local icon map that returns paired outline and filled SVG variants per tab. Update `Tabbar` so each item renders:
- the proper icon variant based on `isActive`
- a lobster glyph for the second tab
- stable `data-*` hooks for test assertions
- no active indicator element or icon framing container

Keep:
- tab order
- unread badge behavior
- route-driven active state
- click/reselect behavior

**Step 2: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run src/components/Tabbar/Tabbar.render.test.tsx src/components/Tabbar/Tabbar.navigation.test.tsx`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.

### Task 3: Apply the IM-style bottom bar styling

**Files:**
- Modify: `src/components/Tabbar/Tabbar.mobile.css`

**Step 1: Write minimal implementation**

Update the tabbar CSS to:
- remove icon framing styles and active indicator styling
- keep inactive items visually restrained
- slightly strengthen active label weight/color
- preserve current height and safe-area behavior
- keep the chat badge visually clear near the new borderless icon glyph
- use short, restrained transitions only

**Step 2: Run targeted test and build verification**

Run: `pnpm.cmd exec vitest run src/components/Tabbar/Tabbar.render.test.tsx src/components/Tabbar/Tabbar.navigation.test.tsx`
Expected: PASS

Run: `pnpm.cmd run build`
Expected: PASS

**Step 3: Commit**

Skip commit in this session.
