# Theme Color System Design

**Topic:** Productize the mobile app appearance system with curated theme color schemes and a lobster default.

**Goal:** Upgrade the current accent color setting from a row of generic swatches into a polished theme color system with named presets, richer previews, and a lobster default, while preserving the existing light/dark surface preset architecture.

## Problem

The current appearance system already supports `themePreset` and `accentPreset`, but the color layer still behaves like an engineering setting rather than a productized theme experience.

This causes four problems:

- Users choose from anonymous accent dots instead of intentional theme color schemes.
- The default color is still generic blue rather than a brand-forward lobster theme.
- Theme tokens derive from a single color only, so preset personality feels weaker than it should.
- Existing stored legacy accent values need compatibility handling if the preset catalog changes.

## Scope

This iteration changes only the appearance settings system:

- `packages/sdkwork-react-mobile-settings/src/types/index.ts`
- `packages/sdkwork-react-mobile-settings/src/services/SettingsService.ts`
- `packages/sdkwork-react-mobile-settings/src/services/SettingsService.test.ts`
- `packages/sdkwork-react-mobile-settings/src/pages/ThemePage.tsx`
- `packages/sdkwork-react-mobile-settings/src/hooks/useSettings.ts`
- `packages/sdkwork-react-mobile-settings/src/i18n/en.ts`
- `packages/sdkwork-react-mobile-settings/src/i18n/zh.ts`
- `packages/sdkwork-react-mobile-settings/src/index.ts`
- `src/theme/appearanceTokens.ts`
- `src/theme/appearanceTokens.test.ts`
- `src/theme/themeContext.tsx`
- new shared theme color metadata file and a render test for the settings page

Out of scope:

- Replacing the current `themePreset` surface architecture
- Removing custom hex input entirely
- Redesigning non-appearance settings pages
- Broad visual refactors unrelated to appearance tokens

## Approaches considered

### Option 1: Add more accent dots

Pros:

- Fastest
- Smallest diff

Cons:

- Still feels like raw color configuration
- Weak product narrative

Result: rejected

### Option 2: Curated theme color schemes over the existing accent system

Pros:

- Reuses the current architecture
- Gives each preset a name, mood, and preview
- Allows lobster to become the default cleanly
- Keeps compatibility with existing appearance storage

Cons:

- Requires shared metadata and migration logic

Result: chosen

### Option 3: Replace `themePreset + accentPreset` with one monolithic theme model

Pros:

- Most expressive in theory

Cons:

- Too much migration and risk for this iteration
- Unnecessary because the current two-layer architecture is already workable

Result: rejected

## Chosen approach

Keep the existing `themePreset` surface families and evolve `accentPreset` into a curated theme color catalog.

### Theme color catalog

The new preset catalog should be intentional and branded, not generic:

- `lobster`
- `tech-blue`
- `green-tech`
- `aurora-teal`
- `sunset-coral`
- `violet-signal`
- `graphite-ice`

Each preset should define:

- primary accent color
- richer preview gradient metadata
- display name and short description
- enough metadata for the appearance page to render a stronger selection UI

### Default behavior

- New installs default to `lobster`.
- Reset appearance also restores `lobster`.
- Existing persisted legacy preset values should be normalized to their closest new equivalent instead of being discarded.

Recommended legacy mapping:

- `blue` -> `tech-blue`
- `teal` -> `aurora-teal`
- `green` -> `green-tech`
- `orange` -> `sunset-coral`
- `rose` -> `lobster`
- `violet` -> `violet-signal`

### Token behavior

Preset themes should not feel like a single raw hex applied everywhere.

For preset-based themes:

- `--primary-color` still comes from the preset accent
- gradient tokens should use preset-authored gradient metadata
- dark-mode tab active color can use preset-aware lifted variants
- custom hex input remains available and continues to use the generic mix algorithm

This preserves flexibility while making named presets more polished than arbitrary hex input.

### Settings page behavior

The appearance page should present theme colors as cards rather than dots.

Each scheme card should include:

- scheme name
- one-line description
- mini gradient preview
- selected state

Custom hex input remains as an advanced path, visually secondary to the curated schemes.

## Architecture impact

Theme color metadata should live in one shared settings module file and be exported for reuse by:

- settings defaults and normalization
- appearance token resolution
- theme settings page UI

This prevents theme names, colors, defaults, and compatibility maps from drifting across files.

## Testing strategy

Add and update tests for:

- settings defaults and reset behavior use `lobster`
- legacy accent aliases normalize to the new catalog
- appearance token resolution uses the new preset metadata
- the theme settings page renders the curated theme scheme options and selects lobster correctly

Run the targeted settings and theme tests first, confirm failure, then implement.

## Success criteria

The change is successful when:

- the default appearance uses lobster theme colors
- users can choose from multiple polished named theme color schemes
- old persisted accent preset values migrate safely
- the appearance settings page feels productized instead of purely technical
