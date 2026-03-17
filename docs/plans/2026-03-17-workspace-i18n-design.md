# Workspace Internationalization Design

## Goal

Establish a single, production-grade internationalization system for the mobile workspace so that:

- `zh-CN` remains the default language.
- runtime locale resolution is deterministic and request-aware.
- all user-facing strings in app and package runtime code flow through localization.
- package-level translation islands are merged into one app-level translation source.
- locale-aware formatting uses the active app locale instead of browser defaults.
- non-locale source files no longer contain Chinese comments or direct Chinese UI copy.

## Current State

The workspace currently mixes three patterns:

1. Root app translation through `src/core/i18n/I18nContext.tsx`.
2. Package-local translation exports such as `packages/*/src/i18n/{en,zh}.ts`.
3. Page-level fallback copy and local locale dictionaries embedded in components.

This creates inconsistent runtime behavior:

- several package pages rely on inline fallback text instead of guaranteed locale resources.
- `packages/sdkwork-react-mobile-agents` owns a disconnected locale state.
- settings, search, and a few other modules maintain their own translation logic.
- date and number formatting often use `undefined` or hard-coded locale values.
- many runtime files still contain direct Chinese copy, Chinese comments, or mojibake.

## Recommended Architecture

### 1. One translation source of truth

Use `i18next` as the only translation engine and keep `src/core/i18n/I18nContext.tsx` as the compatibility facade for existing callers.

The provider will:

- initialize a shared `i18next` instance once.
- expose `locale`, `setLocale`, and `t`.
- expose locale-aware format helpers for date, time, and numbers.
- update `document.documentElement.lang`.

This preserves current component ergonomics while replacing the custom dictionary lookup with a robust engine.

### 2. Deterministic locale resolution

Runtime locale resolution follows this exact priority:

1. explicit URL/request locale via `?locale=` or `?lang=`
2. previously persisted app setting
3. browser/device locale
4. project default `zh-CN`

Supported locale inputs are normalized to `zh-CN` or `en-US`.

The resolved locale must be applied before normal page rendering whenever possible, then kept in sync with settings updates.

### 3. Merge package translations into root resources

Create a resource builder that deep-merges:

- root app locale files under `src/core/i18n/locales`
- package locale files under `packages/*/src/i18n`

This eliminates package translation silos and allows all routed pages to resolve the same keys through the root provider.

### 4. Replace isolated translation islands

The following modules will be normalized:

- `packages/sdkwork-react-mobile-agents`: remove internal mutable locale state and bind to the root provider.
- `packages/sdkwork-react-mobile-settings`: stop using the embedded `translations` table inside `useSettings` as a separate source of truth.
- `packages/sdkwork-react-mobile-search`: remove page-local locale dictionary and resolve copy through shared resources.

### 5. Locale-aware formatting

Add shared formatter helpers so runtime formatting always uses the active app locale:

- date
- time
- dateTime
- number
- compact currency or explicit currency formatting when needed

All current `toLocaleString(undefined)` and hard-coded locale formatting in user-facing flows should be migrated to the helper or to explicit active-locale values.

### 6. Code hygiene and enforcement

Add an audit test that scans runtime source files and fails when:

- non-locale runtime files contain Chinese characters
- non-locale runtime files contain mojibake markers

Allowed exceptions:

- locale resource files
- test fixtures and assertions
- region dataset files that intentionally model canonical geographic names, if they are not yet converted to keyed resources

The first implementation should keep exceptions minimal and documented.

## Data and Content Strategy

### User-facing fallback copy

Where pages already call `tr('key', 'fallback')`, keep the fallback behavior but convert residual Chinese fallback strings to English. The active user locale should still come from real resources, not the fallback.

### Mock and seeded data

If mock content is rendered to users, it must become locale-aware. Prefer one of:

- localized content factories keyed by locale
- content label keys resolved at view-model time

Do not keep Chinese-only seeded content in runtime code.

## Error Handling

- Unsupported locale inputs normalize to `zh-CN`.
- Missing keys return the key string only as a last-resort developer fallback.
- settings persistence failures should not block immediate locale switching in memory.
- package pages must continue rendering even while settings bootstrap is still loading.

## Testing Strategy

1. Add failing unit tests for locale resolution priority and normalization.
2. Add failing tests for merged resources containing package translations.
3. Add failing tests for provider formatting behavior.
4. Add a failing audit test for non-locale Chinese runtime strings.
5. Add targeted regression tests for modules with prior custom locale logic such as search and settings.

## Scope of This Iteration

This implementation iteration will prioritize:

- unified root i18n engine
- resource merge from packages
- runtime locale resolution and formatting
- de-isolating search, settings, and agents
- removing direct Chinese from the highest-risk runtime pages, components, services, and comments
- adding enforcement so remaining gaps are visible and actionable
