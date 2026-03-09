# Drive Panel Refinement Design

**Topic:** Upgrade the five primary `Drive` tab panels inside `CloudDrivePage` to feel closer to a professional cloud-drive mobile app.

**Goal:** Make `files`, `recent`, `transfer`, `category`, and `space` feel like distinct product surfaces within one Drive workbench, without adding new routes or changing upload/storage behavior.

## Problem

`CloudDrivePage` already has a strong top-level workbench and tabbar structure, but the five tab panels still read like variations of the same generic card list. The current information density is acceptable, but it does not yet feel like a polished cloud-drive product.

This creates three product problems:

- The five tabs do not communicate enough purpose difference at a glance
- `transfer` and `space` lack the operational clarity expected from a serious drive product
- `recent` and `category` expose useful data, but they do not feel like decision-oriented work surfaces

## Scope

This iteration changes only:

- `packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.tsx`
- `packages/sdkwork-react-mobile-drive/src/pages/CloudDrivePage.css`
- Related Drive tests and locale strings

Out of scope:

- New Drive routes
- File preview/detail pages
- Backend/store changes
- Upload, delete, or breadcrumb logic changes
- Search, share, or permission features

## Approaches considered

### Option 1: Panel-level refinement inside the existing page

Pros:

- Lowest risk
- Preserves the good single-page mobile tabbar architecture already built
- Keeps the iteration focused on product polish rather than workflow expansion

Cons:

- Does not add deeper file-detail or preview flows

Result: chosen

### Option 2: Introduce new file-detail and transfer-detail routes

Pros:

- More complete drive product flow
- Opens the door for richer interactions later

Cons:

- Expands scope into routing, state handoff, and deeper behavior contracts
- Slows down the current polishing pass

Result: rejected for this iteration

## Chosen approach

Keep the current tabbar workbench, but make each panel feel like a dedicated operational surface.

### Files panel

- Add a compact spotlight strip above the file list to summarize current folder mode:
  - current folder
  - active filter
  - current count
- Use it as a stronger bridge between hero context and file browsing
- Keep existing list/grid, breadcrumb, filter, delete, and folder-open behavior unchanged

### Recent panel

- Add a recent-focus summary card before the recent list
- Show a clearer “resume work” framing instead of only rendering a flat list
- Keep recent-file navigation behavior unchanged

### Transfer panel

- Upgrade transfer into a true operations board
- Add a transfer overview deck highlighting:
  - running tasks
  - completed tasks
  - failed tasks
- Add a compact queue narrative so the panel feels like an active transfer center, not only a list
- Keep queue data model and clear-finished behavior unchanged

### Category panel

- Add a category leaderboard / overview strip that emphasizes the most populated media type
- Keep the existing category grid and “jump into files tab with filter” behavior unchanged

### Space panel

- Add a reclaim-priority section that highlights the heaviest media groups first
- Make storage advice feel actionable and product-led, not just informational
- Keep current storage stats and percentage logic unchanged

## Testing strategy

- Extend `CloudDrivePage.tabbar.test.ts` with source-level expectations for the new panel surfaces
- Add locale assertions only for newly introduced Drive labels
- Run the targeted Drive tests first and verify they fail before implementation
- Run Drive + shared locale regressions after implementation
- Run the Vite development build to confirm no compile or style regressions
