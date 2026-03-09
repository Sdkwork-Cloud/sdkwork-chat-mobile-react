# Notes Workbench Design

**Topic:** Productize the mobile Notes home page into a Notion-style collaboration workbench while keeping the module tabbar.

**Goal:** Turn `NotesPage` from a plain list shell into a team workspace entry point that feels purpose-built for docs, tasks, wiki knowledge, and recent collaboration activity.

## Product direction

The current Notes page already exposes four useful tabs: `docs`, `tasks`, `wiki`, and `activity`. The problem is presentation, not information architecture. Right now the page behaves like a generic module list with a hero, a few counters, and tab-specific cards. It does not feel like a collaboration workspace.

The target experience is closer to a mobile Notion workbench:

- A command-style top shell that suggests search, workspace switching, and capture
- A primary workspace card that establishes context for the team space
- Immediate quick actions for the most frequent collaboration jobs
- A compact overview of knowledge, task load, and recent edits before the user dives into a tab
- A persistent tabbar so docs, tasks, wiki, and activity still remain first-class views

## Scope

This iteration only changes the Notes home page and supporting locale/test coverage:

- `packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tsx`
- `packages/sdkwork-react-mobile-notes/src/pages/NotesPage.css`
- `packages/sdkwork-react-mobile-notes/src/pages/NotesPage.tabbar.test.ts`
- `src/core/i18n/locales/en-US/notes.ts`
- `src/core/i18n/locales/zh-CN/notes.ts`
- `src/core/i18n/locales/emailNotesLocale.test.ts`

Out of scope:

- Notes document detail page
- Notes create page
- Notes service data model
- Routing changes

## Chosen approach

Use the existing `NotesWorkspaceSnapshot` data without changing service contracts. The workbench will be a richer composition layer in `NotesPage`.

### Structure

1. Top command shell
- Back button
- Search / command affordance
- Workspace identity pill

2. Workspace panel
- Workspace kicker
- Strong workspace title and subtitle
- Quick create CTA
- Dense metric cards for docs, open tasks, wiki, activity

3. Quick actions row
- New doc
- Open tasks
- Open wiki

4. Knowledge strip / preview section
- A small preview area showing latest docs or wiki highlights to give the page more “workspace memory”

5. Active tab section
- Keep the existing `docs / tasks / wiki / activity` content switching
- Upgrade cards visually so the active view feels integrated into the workbench

6. Bottom tabbar
- Preserve the existing four tabs
- Keep badge counts

## Alternatives considered

### Option 1: Full board-style canvas
Pros:
- Strong Notion feel
- More editorial personality

Cons:
- Requires denser layout logic and likely changes to data model
- Harder to keep readable on small screens

Result: rejected for this iteration

### Option 2: Keep current layout and only reskin it
Pros:
- Low risk
- Very fast

Cons:
- Would still feel like a generic module list
- Misses the main product opportunity

Result: rejected

### Option 3: Workbench shell on top of existing tab panels
Pros:
- Keeps data and routes stable
- Achieves a meaningful UX jump
- Fits the iterative way this app is being upgraded

Cons:
- Still a composition layer rather than a fully custom collaborative surface

Result: chosen

## UX details

- `docs` remains the default tab because it is the broadest collaboration entry
- `tasks` gets a faster quick action path from the workbench
- `wiki` should feel like durable knowledge, not just another list
- `activity` should read like a clean timeline, not a dump of system events
- Empty states stay consistent with the upgraded visual system
- The page must remain mobile-first and not collapse on narrow screens

## Error handling

There is no network error state in the current notes service model. This iteration keeps that contract. If a tab has no content, the page continues to use the existing empty state pattern.

## Testing strategy

- Update the Notes page source-level product test to require the new workbench structure classes
- Extend locale coverage to include the new Notes workbench keys
- Run targeted Notes tests first
- Run related workbench regression tests after implementation
- Run a development build to verify CSS and module integration
