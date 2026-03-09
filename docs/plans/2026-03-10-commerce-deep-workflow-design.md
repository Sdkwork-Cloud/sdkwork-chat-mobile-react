# Commerce Deep Workflow Design

**Topic:** Upgrade the `commerce` deep workflow pages so the order and gig flows match the quality of the new mobile workbench home pages.

**Goal:** Turn `MyGigsPage`, `OrderListPage`, and `OrderDetailPage` into clearer mobile work surfaces with stronger hierarchy, better action focus, and clean locale coverage, without changing the underlying service contracts or route wiring.

## Problem

`GigCenterPage` already feels like a professional mobile workbench, but the pages that follow it still feel like legacy utility screens.

The current issues are concentrated in three areas:

- `MyGigsPage` is a thin list + popup flow with weak hierarchy and heavy inline styles
- `OrderListPage` exposes order data, but does not yet feel like a mobile queue/operations page
- `OrderDetailPage` shows the data, but the page does not frame fulfillment, logistics, payment, and next actions as one coherent workflow

There is also a content-quality issue:

- the `commerce` Chinese locale contains corrupted strings for many gig and order keys
- several deep pages still ship garbled fallback text, which creates visible product debt when translation values are missing or broken

## Scope

This iteration changes only:

- `packages/sdkwork-react-mobile-commerce/src/pages/MyGigsPage.tsx`
- `packages/sdkwork-react-mobile-commerce/src/pages/MyGigsPage.css`
- `packages/sdkwork-react-mobile-commerce/src/pages/OrderListPage.tsx`
- `packages/sdkwork-react-mobile-commerce/src/pages/OrderListPage.css`
- `packages/sdkwork-react-mobile-commerce/src/pages/OrderDetailPage.tsx`
- `packages/sdkwork-react-mobile-commerce/src/pages/OrderDetailPage.css`
- related commerce page contract tests
- `src/core/i18n/locales/en-US/commerce.ts`
- `src/core/i18n/locales/zh-CN/commerce.ts`

Out of scope:

- service behavior changes in `GigService` or `OrderService`
- route changes
- payment, refund, logistics, or settlement business logic changes
- new backend or SDK contracts
- deep analytics or search features

## Approaches considered

### Option 1: Visual refresh only

Pros:

- Smallest diff
- Fastest implementation

Cons:

- Does not solve workflow clarity
- Leaves the pages structurally behind the workbench standard

Result: rejected

### Option 2: Deep-page workbench refinement inside existing routes

Pros:

- Keeps current routing and data contracts stable
- Raises the pages to the same product language as `GigCenterPage`
- Lets the next polishing pass build on strong internal structure

Cons:

- Requires coordinated page, CSS, and locale work

Result: chosen

### Option 3: Introduce more routes for gig detail, order timeline, and refund flows

Pros:

- Most complete long-term workflow
- Supports richer multi-step flows later

Cons:

- Expands scope into navigation, state handoff, and more contract surface
- Slows down the current product-polish pass

Result: deferred

## Chosen approach

Keep the current route model, but rebuild the three deep pages as focused operational surfaces.

### My gigs

Turn `MyGigsPage` into a fulfillment workbench:

- add a hero card that frames current workload and earnings
- promote active/history switching into a true tabbar treatment
- add summary metrics for active, waiting review, and completed work
- rebuild task cards with better status hierarchy, requirement visibility, and next-step CTAs
- upgrade the bottom popup into a more intentional command sheet with summary blocks and clearer actions

### Order list

Turn `OrderListPage` into an order queue center:

- add a hero card with queue framing and live counts
- keep status switching, but restyle it as a strong tabbar/workbench control
- add top-level metrics that help users decide where to act next
- reshape each order card so status, quantity, total, and action priority are obvious
- keep current order actions and callbacks intact

### Order detail

Turn `OrderDetailPage` into a fulfillment console:

- preserve the status hero, but deepen it with stronger summary, action context, and progress framing
- add a compact journey/step section so users can see where the order sits in the lifecycle
- reorganize shipping, product, amount, and overview sections into clearer surfaces
- make the footer actions feel like the final decision row rather than generic buttons

### Locale and fallback cleanup

Fix the locale contract for this workflow by:

- adding or rewriting the needed English strings in `en-US/commerce.ts`
- rewriting the relevant Chinese keys in `zh-CN/commerce.ts` with clean copy
- replacing garbled fallback text in page components with readable defaults

## Testing strategy

- add source-level contract tests for `MyGigsPage`, `OrderListPage`, and `OrderDetailPage`
- extend the locale test to cover the new deep-workflow keys for both `en-US` and `zh-CN`
- run the targeted commerce and locale tests first and verify they fail before implementation
- run the relevant regressions after implementation
- run the Vite development build to confirm no compile or style regressions
