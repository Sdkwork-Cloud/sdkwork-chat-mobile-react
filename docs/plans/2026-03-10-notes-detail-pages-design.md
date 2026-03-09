# Notes Detail Pages Design

**Topic:** Align `NotesDocPage` and `NotesCreatePage` with the upgraded Notes workbench visual system.

**Goal:** Make the Notes detail and create flows feel like part of the same product surface as the new Notion-style home page, without expanding editing scope or changing data flow.

## Problem

`NotesPage` now has a clear collaboration-workbench identity, but `NotesDocPage` and `NotesCreatePage` still look like generic form/list pages. The module currently loses visual continuity as soon as the user opens a document or starts drafting a new note.

This creates two UX problems:

- The product feels stitched together instead of intentionally designed
- The user loses workspace context when moving from browse mode to read/edit mode

## Scope

This iteration only upgrades presentation and structure for:

- `packages/sdkwork-react-mobile-notes/src/pages/NotesDocPage.tsx`
- `packages/sdkwork-react-mobile-notes/src/pages/NotesDocPage.css`
- `packages/sdkwork-react-mobile-notes/src/pages/NotesCreatePage.tsx`
- `packages/sdkwork-react-mobile-notes/src/pages/NotesCreatePage.css`
- Related tests and locale strings where necessary

Out of scope:

- Rich text editing
- Comments / mentions
- Collaboration cursors
- Route changes
- Service/model changes

## Chosen approach

Keep all current behavior but move both pages into the Notes workbench design language.

### NotesDocPage

- Replace the plain top bar with a command-style shell similar to the new Notes home page
- Add a document hero / cover card containing:
  - document label
  - title
  - owner / update metadata
  - primary edit action
- Keep the existing `InlineFeedback`, but style it as part of the page system rather than an isolated alert
- Render summary and body content inside a stronger reading surface with better spacing and hierarchy
- Improve the empty state so it feels like a workspace surface rather than a fallback string

### NotesCreatePage

- Replace the current bare form shell with a workspace drafting surface
- Use a command-style header with back, title, and save action
- Add a drafting hero card that explains the current mode:
  - new draft
  - editing from template/source document
- Keep the current local draft persistence and unsaved-confirm logic unchanged
- Move title/content inputs into larger editorial cards so the page feels like a note editor instead of a generic form

## Alternatives considered

### Option 1: Visual-only alignment
Pros:
- Lowest risk
- Fastest path to consistency
- Preserves all current tests and behaviors

Cons:
- Does not add richer editing capability

Result: chosen

### Option 2: Partial editor upgrade
Pros:
- Closer to real Notion editing feel

Cons:
- Expands scope into content tooling and state design
- Hard to finish safely in an incremental pass

Result: rejected for this iteration

## Testing strategy

- Extend route page contract tests with structure expectations for the upgraded page shells
- Add locale assertions only for newly introduced copy
- Run Notes route tests first
- Run broader Notes / Email / Discover / Drive / Commerce regressions afterward
- Run development build to confirm styles compile cleanly
