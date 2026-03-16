# Tabbar Icon Refresh Design

**Topic:** Refresh the global mobile bottom tabbar to use borderless IM-style icons with outline and filled states.

**Goal:** Make the five primary shell tabs feel closer to WeChat-style instant messaging tabbars by using pure glyph icons, no icon container framing, and cleaner filled/outline state changes without changing routing or shell ownership.

## Problem

The current bottom tabbar in [src/components/Tabbar/Tabbar.tsx](/D:/javasource/spring-ai-plus/spring-ai-plus-business/apps/sdkwork-chat-mobile-react/src/components/Tabbar/Tabbar.tsx) uses one inline SVG icon per tab and only distinguishes active state through color and slightly heavier strokes. That keeps the shell functional, but it does not read like a productized mobile navigation system.

This causes three UX issues:

- The current icon system still feels like icons are being presented inside a state container rather than as native tab glyphs.
- Several icons read as outlined emblems with circular or outer-frame emphasis instead of the cleaner tab glyphs used by major IM apps.
- The second tab icon does not match the requested product metaphor and needs to become a lobster-shaped glyph while keeping the existing tab label.

## Scope

This iteration changes only the global shell tabbar and its regression coverage:

- `src/components/Tabbar/Tabbar.tsx`
- `src/components/Tabbar/Tabbar.mobile.css`
- `src/components/Tabbar/Tabbar.navigation.test.tsx`
- `src/components/Tabbar/Tabbar.render.test.tsx` (new)
- `src/components/Tabbar/tabbarIcons.tsx` (new, if extracted)

Out of scope:

- Route ownership or `resolveTabByPath` behavior
- Tab click behavior and reselect policy
- Module-local page tabbars
- Locale keys or tab labels
- Layout height, safe-area policy, or floating-layer rules

## Approaches considered

### Option 1: Icon-only refresh

Use `outline -> filled` icons, keep the current flat tab item layout, and only tune active label weight.

Pros:

- Lowest risk
- Minimal CSS churn

Cons:

- The upgrade reads like a small icon swap rather than a shell polish pass
- Active state still depends too much on text color

Result: rejected

### Option 2: Borderless glyph system with filled/outline states

Use `outline -> filled` icons with no outer icon container, no capsule indicator, and no circular framing. Keep labels visible for every tab and preserve the overall tabbar height.

Pros:

- Aligns better with WeChat-style IM tabbars where the icon glyph itself carries state
- Removes the current "icon wrapped by a control" feeling
- Keeps the shell quiet and content-first

Cons:

- Requires the icon set itself to be redesigned more carefully

Result: chosen

### Option 3: Strong brand pill for the full tab item

Wrap the entire active tab item in a larger pill or stronger brand surface.

Pros:

- Strongest emphasis
- Highest visual differentiation

Cons:

- Easy to make visually heavy
- More likely to fight the existing glassy shell treatment

Result: rejected

## Chosen approach

Refresh the tabbar with a restrained IM-style glyph pattern:

- Inactive tabs use outline icons.
- The active tab uses a filled icon variant.
- The icon itself carries the state change. There is no active icon capsule, no circular frame, and no outer icon border treatment.
- Labels remain visible for all five tabs.
- Active labels get slightly stronger weight and color, but icon state does most of the work.

### Icon behavior

Each shell tab gets two dedicated icon variants:

- `chat`: outline chat bubble -> filled chat bubble
- `agents`: outline lobster -> filled lobster
- `creation`: outline spark -> filled spark
- `discover`: outline direction marker -> filled direction marker
- `me`: outline profile silhouette -> filled profile silhouette

The inactive and active variants should be designed as pairs, not as the same path with heavier strokes. The active form needs to look intentionally filled.

### Labels and spacing

- Keep every label visible to preserve fast recognition.
- Increase active label emphasis slightly through weight and color.
- Keep overall tabbar height effectively stable so the shell layout and safe-area behavior do not need adjustment.
- Preserve the unread badge on `chat`, but reposition it so it does not collide with the borderless icon glyph.

## Architecture impact

Navigation ownership stays exactly where it is now:

- `APP_TABS` in [src/app/shell/navigation.ts](/D:/javasource/spring-ai-plus/spring-ai-plus-business/apps/sdkwork-chat-mobile-react/src/app/shell/navigation.ts) remains the single source of tab metadata.
- `resolveTabClickAction` in [src/components/Tabbar/tabClickPolicy.ts](/D:/javasource/spring-ai-plus/spring-ai-plus-business/apps/sdkwork-chat-mobile-react/src/components/Tabbar/tabClickPolicy.ts) remains unchanged.
- The shell continues to control active tab state by location path.

Presentation concerns should be isolated to the tabbar component. If the icon definitions become noisy, extract them into `src/components/Tabbar/tabbarIcons.tsx` so [src/components/Tabbar/Tabbar.tsx](/D:/javasource/spring-ai-plus/spring-ai-plus-business/apps/sdkwork-chat-mobile-react/src/components/Tabbar/Tabbar.tsx) stays focused on behavior and rendering structure.

## Error handling and resilience

This change does not alter any async behavior, route changes, or data contracts.

- Haptic behavior stays wrapped in `try/catch`.
- If unread count is absent, badge behavior remains unchanged.
- If the icon mapping is extracted, it should remain local to the tabbar to avoid introducing a shared dependency surface.

## Testing strategy

Add regression coverage for presentation state, not just navigation policy:

- Keep the existing navigation policy tests in [src/components/Tabbar/Tabbar.navigation.test.tsx](/D:/javasource/spring-ai-plus/spring-ai-plus-business/apps/sdkwork-chat-mobile-react/src/components/Tabbar/Tabbar.navigation.test.tsx).
- Add a render-focused tabbar test that verifies:
  - the active tab renders the filled variant
  - inactive tabs render outline variants
  - the second tab uses the lobster icon glyph
  - there is no active icon indicator element
  - the unread badge still renders on chat when present
- Run the new render test first and make sure it fails before implementation.

## Success criteria

The refresh is successful when:

- active and inactive tabs are distinguishable through icon form, not just color
- the active state reads clearly in one glance on a phone-sized layout
- the shell keeps the same routing behavior and tab ownership
- the visual treatment feels current without making the bottom bar too loud
