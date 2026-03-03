# Config Center V2 Design

**Date:** 2026-03-02
**Scope:** Global configuration center, system dark mode, theme presets, accent colors, global font scale, and conversation list color system.

## 1. Goals
- Build one global configuration model for appearance and typography.
- Support `system | light | dark` mode switching.
- Support theme presets and accent color customization.
- Unify conversation list visuals under semantic/component tokens.
- Keep backward compatibility with legacy `theme` and `fontSize` fields through migration.

## 2. Current Problems
- Theme state is split across settings store, `themeContext`, CSS selectors, and hard-coded styles.
- Conversation list still contains fixed colors that drift from theme tokens.
- No first-class `system` mode.
- Font configuration is pixel-based and not globally normalized.

## 3. Architecture
### 3.1 Config Domain
`AppConfig` gains schema-driven appearance fields:
- `schemaVersion`
- `appearanceMode`
- `themePreset`
- `accentType`
- `accentPreset`
- `accentHex`
- `fontScale`

Legacy fields (`theme`, `fontSize`) remain for compatibility and are synchronized from V2.

### 3.2 Migration Strategy
- On config load/update, run normalization+migration.
- Legacy theme maps to mode+preset.
- Legacy font size maps to `fontScale`.
- Defaults are auto-filled for all missing fields.

### 3.3 Appearance Engine
A runtime resolver computes:
- resolved mode (handles `system` with media query)
- base palette from preset + mode
- accent palette from preset or custom hex
- semantic + component CSS variables
- legacy theme alias for existing `[data-theme=...]` CSS compatibility

### 3.4 Provider Integration
`ThemeProvider` consumes settings store as the single source and applies resolved tokens to `document.documentElement`.

### 3.5 UI Integration
Theme page upgrades into a configuration center panel with:
- mode controls
- preset controls
- accent controls (preset + custom)
- font scale slider and preview

## 4. Token Model
- Semantic tokens: backgrounds, text, borders, nav/tab colors, bubble colors.
- Component tokens: conversation list button/empty/divider/pinned/pressed/unread styles.

## 5. Rollout Plan
1. Core types + migration + resolver + tests.
2. Theme provider runtime adoption.
3. Config center UI update.
4. Conversation list CSS tokenization.
5. Incremental cleanup of legacy pages and duplication.

## 6. Acceptance Criteria
- System dark mode follows OS in real time.
- Conversation list colors remain consistent under all presets/modes.
- Font scale applies globally and persists.
- Old users migrate automatically without losing settings.
