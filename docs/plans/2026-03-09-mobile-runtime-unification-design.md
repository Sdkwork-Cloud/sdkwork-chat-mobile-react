# Mobile Runtime Unification Design

**Date:** 2026-03-09
**Scope:** Unify Browser H5, PWA, and Capacitor App runtime architecture; harden mobile shell standards; and convert architecture standards into enforceable code, scripts, and tests.

## 1. Goals
- Build one runtime architecture that supports browser, PWA, and Capacitor App without parallel platform implementations.
- Make `@sdkwork/react-mobile-core/platform` the only source of truth for platform detection, capability wrappers, runtime hooks, and native integration.
- Guarantee that browser and app both remain operational through explicit fallback and degradation strategies.
- Formalize PWA baseline, mobile shell baseline, and Capacitor baseline into validation scripts and tests.
- Reduce future architecture drift by removing legacy entry paths and defining clear ownership boundaries.

## 2. Current Problems
- Platform ownership is split between root app code and core platform code.
- [`index.tsx`](../../../index.tsx) still injects a legacy web platform implementation directly.
- [`src/platform/index.ts`](../../../src/platform/index.ts) adapts core platform but still behaves like a second platform facade with its own fallback rules.
- [`src/platform-impl/web/index.ts`](../../../src/platform-impl/web/index.ts) still exists as a legacy runtime path, including one-off storage migration behavior.
- PWA dependencies exist, but there is no complete manifest, service worker registration, or runtime update strategy in the active app path.
- Safe area and shell behaviors are partly standardized in CSS, but JS/runtime integration remains incomplete. [`src/mobile/hooks/useSafeArea.ts`](../../../src/mobile/hooks/useSafeArea.ts) is still a placeholder.
- Capacitor capability auditing is in strong shape, but architecture gates do not yet protect against direct plugin imports or legacy runtime reintroduction.

## 3. Architectural Decision
Adopt a **single-core runtime** architecture:

- Root app owns shell composition only.
- Core package owns runtime/platform behavior only.
- Browser H5, PWA, and Capacitor App share one initialization model and one platform contract.
- Native container configuration remains isolated in Capacitor config and native project files.
- Standards become executable through scripts, tests, and CI commands.

This keeps architecture clean without forcing a full package-platform rewrite.

## 4. Target Architecture
### 4.1 Layering
- **App Shell Layer**
  - Files under `src/app`, `src/router`, `src/layouts`, `src/theme`, and root-level composition code.
  - Responsibilities: routing, layout, tabbar orchestration, providers, shell overlays, theme/meta coordination.
- **Platform Runtime Core Layer**
  - Files under `packages/sdkwork-react-mobile-core/src/platform`.
  - Responsibilities: environment detection, platform wrappers, runtime hooks, capability inspection, permission preflight, app/network lifecycle, payment callback routing, push registration, storage policies.
- **Feature Package Layer**
  - Files under `packages/sdkwork-react-mobile-*`.
  - Responsibilities: business behavior only, always depending on core platform interfaces instead of raw plugins.
- **Native Container Layer**
  - Files such as `capacitor.config.ts`, `android/`, and future `ios/`.
  - Responsibilities: app container configuration, permission declarations, plugin sync targets.
- **Standards and Validation Layer**
  - Files under `docs/`, `scripts/`, tests, and package scripts.
  - Responsibilities: enforce architecture, PWA, mobile shell, and Capacitor standards.

### 4.2 Ownership Boundaries
- `@sdkwork/react-mobile-core/platform` is the only runtime truth for platform detection and capability wrappers.
- Root `src/platform` may remain temporarily as a thin compatibility facade, but it must not own independent runtime behavior.
- `src/platform-impl/web` must exit the active runtime path.
- Feature packages must not import `@capacitor/*` directly.

## 5. Runtime Model
### 5.1 Unified Startup Flow
The app boot sequence becomes:

1. Root entry imports global styles and calls `bootstrapApp()`.
2. `bootstrapApp()` initializes core platform once.
3. `bootstrapApp()` initializes platform runtime hooks once.
4. Browser-like environments register PWA runtime support.
5. React app renders after runtime bootstrap state is known.

This removes the current split where the root entry preloads a legacy web platform while `App.tsx` also initializes core platform.

### 5.2 Runtime States
Three runtimes are supported through one contract:

- **Browser H5**
  - Primary focus: route stability, shell rendering, safe area degradation, file selection fallback, notification downgrade, payment URL launch, and recoverable permission errors.
- **PWA**
  - Extends browser runtime with installability, manifest, service worker registration, asset caching, update strategy, and offline shell resilience.
- **Capacitor App**
  - Extends the same runtime with native wrappers, permissions, deep links, push notifications, local notifications, secure storage, biometrics, app lifecycle, and container-level chrome controls.

## 6. Platform Contract Strategy
### 6.1 Single Source Platform Contract
All platform services flow through core types and wrappers:
- device
- storage
- clipboard
- camera
- fileSystem
- notifications
- push
- payment
- share
- network
- keyboard
- statusBar
- splashScreen
- app lifecycle

### 6.2 Capability-First Rule
Every platform-dependent feature must follow:
1. inspect capability or permission state
2. decide execute / degrade / block
3. return a normalized result to upper layers

Pages and business packages must not make hidden runtime assumptions.

### 6.3 Legacy Web Migration
Legacy web-only concerns from [`src/platform-impl/web/index.ts`](../../../src/platform-impl/web/index.ts), especially storage migration, must move into core web runtime initialization so that browser upgrades remain data-safe.

## 7. Mobile Shell Standard
### 7.1 Shell Contract
The shell must own:
- route layout composition
- tabbar presence and reserved interaction area
- floating layer collision rules
- safe area application
- theme/meta synchronization
- app-level overlays

### 7.2 Safe Area Standard
- CSS `env(safe-area-inset-*)` remains the baseline.
- JS hook must expose normalized insets for shell-aware components.
- Pages must not hard-code notch, status bar, or tabbar offsets.

### 7.3 Keyboard Standard
- Native keyboard events and web viewport resize behavior map into one shell-level state model.
- Input pages consume normalized shell behavior rather than direct plugin events.

### 7.4 Theme and Status Bar Standard
- Browser/PWA: update `meta[name="theme-color"]`.
- Native: update Capacitor `StatusBar`.
- Theme transitions must keep both synchronized through one shell-owned abstraction.

## 8. PWA Standard
### 8.1 Required Baseline
- `vite-plugin-pwa` active in root app build.
- Manifest included in the active app path.
- Service worker registered through explicit runtime code.
- Offline-safe app shell available.
- Version update strategy defined.
- Installability and display-mode behavior handled without affecting non-PWA browsers.

### 8.2 Cache Policy
- App shell static assets: precached.
- Media/CDN assets: cache-first with bounded expiration.
- API requests: conservative network-first behavior with strict scope.
- Runtime failure to register service worker must not break the app.

### 8.3 PWA Failure Policy
If PWA enhancement fails, the app remains a normal browser H5 app.

## 9. Capacitor Standard
### 9.1 Existing Strengths to Preserve
The current Capacitor capability baseline and permission audit are already strong and must remain the source of truth for native readiness.

### 9.2 Additional Standardization
- Root entry must not bypass core runtime decisions.
- Native plugin access remains centralized in core platform wrappers.
- Capacitor build/config standards continue to live in docs and scripts, but now also align with runtime entry and shell behavior.
- `validate:standards` must continue to include Capacitor baseline validation.

## 10. Error Handling and Degradation
### 10.1 Non-Negotiable Rule
Enhanced runtime capability failure must never equal app boot failure.

### 10.2 Degradation Examples
- camera unavailable on web -> offer upload/manual alternative
- push unsupported on browser -> show disabled state instead of blocking flow
- payment scheme unsupported -> fallback to supported URL/browser route when allowed
- service worker registration failure -> continue as browser H5
- permission denied -> provide normalized failure reason and recovery guidance

### 10.3 Recovery Events
The runtime must continue to recover on:
- network offline -> online
- app background -> foreground
- deep link callback received
- delayed push/payment sync retry

## 11. Standards as Code
### 11.1 New Validation Gates
Add validation coverage for:
- platform architecture drift
- PWA baseline completeness
- mobile shell baseline

### 11.2 Existing Gate Integration
`validate:standards` becomes the unified standards gate and includes:
- service standard validation
- encoding validation
- Capacitor baseline validation
- new platform/PWA/mobile-shell architecture validation

## 12. Test Strategy
Required tests include:
- bootstrap and runtime initialization tests
- root platform facade compatibility tests
- core web runtime migration tests
- PWA registration/config tests
- mobile shell contract tests for safe area and reserved bottom interaction space
- architecture constraint tests preventing direct `@capacitor/*` imports outside approved core locations

## 13. Migration Strategy
### 13.1 Runtime Migration
- introduce bootstrap path first
- move root entry to bootstrap
- thin root platform facade
- remove legacy web runtime path from active entry

### 13.2 Storage Migration
- preserve existing browser data through one-time idempotent migration
- keep compatibility reads during transition
- converge writes onto the new core-owned storage path

### 13.3 Documentation Migration
- update mobile shell and Capacitor standards docs to reflect actual runtime behavior
- add explicit PWA standard coverage

## 14. Non-Goals
- No full business-package rewrite.
- No redesign of feature routing semantics beyond shell/runtime needs.
- No new native-only business capability outside the standardization work.

## 15. Acceptance Criteria
- Browser H5 boots and completes primary navigation without legacy platform injection.
- PWA manifest and service worker are active and verified through tests/scripts.
- Capacitor baseline validation continues to pass.
- Browser, PWA, and Capacitor App share one startup model.
- Safe area, keyboard, tabbar, and theme/status bar interactions follow one shell standard.
- No active business code path depends on direct raw Capacitor plugin imports outside core-approved runtime wrappers.
- Standards are enforced by scripts and included in `validate:standards`.

## 16. Risks and Controls
- **Risk:** legacy storage behavior regression on browser
  - **Control:** extract migration logic into tested core web runtime utilities before removing legacy entry path.
- **Risk:** PWA registration causes dev/build instability
  - **Control:** isolate registration behind runtime checks and add baseline validation.
- **Risk:** existing imports rely on root `src/platform` behavior
  - **Control:** keep root facade compatibility while moving implementation ownership to core.

## 17. Result Definition
The "best result" for this change set means:
- one runtime architecture instead of two overlapping ones
- browser and app both stay operational
- PWA becomes a first-class delivery target
- Capacitor standards remain strong and become better connected to real runtime behavior
- future regressions are blocked by tests and standards gates instead of code review memory
