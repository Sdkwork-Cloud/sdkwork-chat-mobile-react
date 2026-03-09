# Email Detail Pages Design

**Topic:** Align `EmailThreadPage` and `EmailComposePage` with the upgraded Gmail-style Email workbench.

**Goal:** Make thread reading and compose flows feel like the same product surface as the new Email home page, without changing routing, draft persistence, or send behavior.

## Problem

`EmailPage` already has a strong mobile workbench identity: search shell, account pill, hero workbench card, quick actions, and a clean inbox-first layout. `EmailThreadPage` and `EmailComposePage` still look like placeholder utility pages.

That mismatch creates three UX problems:

- The user loses product continuity when moving from inbox into detail or compose flows
- Important context such as sender, reply origin, and draft state is visually weak
- Core actions like reply and send are technically available but not framed like primary mobile app actions

## Scope

This iteration upgrades only the detail-page composition and styling for:

- `packages/sdkwork-react-mobile-email/src/pages/EmailThreadPage.tsx`
- `packages/sdkwork-react-mobile-email/src/pages/EmailThreadPage.css`
- `packages/sdkwork-react-mobile-email/src/pages/EmailComposePage.tsx`
- `packages/sdkwork-react-mobile-email/src/pages/EmailComposePage.css`
- Related tests and locale strings where needed

Out of scope:

- Real email body rendering
- Attachment handling
- Search implementation
- Draft sync beyond existing local storage behavior
- New route params or service/model changes

## Approaches considered

### Option 1: Visual-only alignment

Pros:

- Lowest risk
- Keeps the current route and draft contracts intact
- Fits the current iteration style used for Drive, Gig Center, Email home, and Notes

Cons:

- Does not add richer mail capabilities such as attachments or message actions

Result: chosen

### Option 2: Partial mail-client feature expansion

Pros:

- Closer to a real Gmail detail and compose experience
- Could introduce richer action density in one pass

Cons:

- Pulls this iteration into state, data model, and API design
- Harder to verify safely because current tests are source-structure contracts

Result: rejected for this iteration

## Chosen approach

Keep all current behavior, but move both pages into the same visual system as `EmailPage`.

### EmailThreadPage

- Replace the plain top bar with a search-shell-inspired command header:
  - back pill
  - title cluster
  - reply action pill
- Keep `InlineFeedback`, but integrate it into the page as a contextual status banner instead of a floating utility message
- Introduce a hero summary card that foregrounds:
  - sender
  - subject
  - time
  - thread category / state if present
- Move the content into a stronger conversation surface with clearer spacing and hierarchy
- Add a compact action row so reply remains visually primary without changing callback behavior
- Improve the empty state to feel like part of the mail workspace

### EmailComposePage

- Replace the bare header with the same command-shell language used by the Email workbench
- Add a draft workspace card that explains the current mode:
  - new draft
  - reply draft
  - auto-saved local draft
- Keep local storage hydration, dirty detection, discard confirmation, and send callback unchanged
- Move recipient, subject, and body into stronger editor panels with clearer grouping
- Surface reply origin as a contextual card rather than a plain inline hint
- Make the send action feel primary while preserving the current `recipient` validation rule

## Testing strategy

- Extend `EmailRoutePages.contract.test.ts` with assertions for the upgraded page shells and layout structure
- Add locale assertions only for newly introduced Email detail-page copy
- Run the targeted Email route and locale tests first and verify they fail before implementation
- Run Email + cross-module regressions after implementation
- Run the Vite development build to confirm the updated CSS and routes compile cleanly
