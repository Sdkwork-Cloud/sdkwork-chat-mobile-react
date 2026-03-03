# Service Interface Standard v2 (Draft)

## 1. Goals
- Ensure every business interaction is exposed through a clear service contract.
- Reserve stable integration points for SDK / native / gateway capabilities.
- Keep implementation evolution incremental without breaking module APIs.

## 2. Scope
- Mandatory scope: `packages/*/src/services/**`
- Root app scope: `src/services/**` (phase mode: gradual migration, non-blocking warnings)

## 3. Mandatory Rules (MUST)
1. Service contract
- Every business module must expose `I*Service` interface as the only stable interaction boundary.
- Service singleton must use explicit interface type:
  - `export const xxxService: IXXXService = createXxxService();`

2. Factory contract
- Factory signature must be:
  - `createXxxService(_deps?: ServiceFactoryDeps)`
- `_deps` must be actually forwarded to implementation/resolver, not only reserved in signature.

3. Runtime dependency injection
- Service implementation must depend on runtime adapters from `resolveServiceFactoryRuntimeDeps`:
  - `storage`, `eventBus`, `logger`, `clock`, `idGenerator`, `command`
- Service layer must not directly call:
  - `Date.now(...)`
  - `crypto.randomUUID(...)`
  - `getPlatform(...)`
- Service layer must not directly import core singletons:
  - `eventBus`, `logger`, `platformService`, `getPlatform`

4. Service/UI boundary
- `packages/*/src/services/**` must not contain runtime `.tsx` files.
- `packages/*/src/services/**` must contain only:
  - `*Service.ts`
  - `index.ts`
  - `types.ts` (optional, service boundary types)
  - `schema.ts` (optional, service payload schema/contracts)
  - service test files (`*.test.ts`, `*.spec.ts`)
- UI state containers (React context/store) must live in `stores/` or `hooks/`.

5. Event facade rule
- UI interaction layers (`pages/hooks/stores`) must not directly use `eventBus`.
- Service layer provides typed subscribe/emit facade APIs for UI.

## 4. Validation Baseline
- Command:
  - `pnpm validate:service-standard`
  - `pnpm validate:encoding`
  - `pnpm validate:encoding:strict`
  - `pnpm validate:standards`
- Gate baseline (active):
  - `pnpm validate:standards` = `service-standard` + `encoding:strict`
- Current validator enforces:
  - Factory signature + `_deps` forwarding
  - Singleton explicit interface annotation
  - Service runtime direct-call ban (`Date.now/getPlatform/randomUUID`)
  - Package service architecture guard (`.tsx` forbidden)
  - Package service singleton-import ban (`eventBus/logger/platformService/getPlatform`)
  - Package service fileset purity (`*Service.ts | index.ts | types.ts | schema.ts | service tests`)
  - Encoding guard:
    - replacement character detection (`U+FFFD`)
    - suspicious long question-mark cluster detection (`?{6,}`)
  - Root service phase migration warnings

## 5. Decision Log / Open Decisions
1. Root `src/services` governance (RESOLVED on 2026-03-02)
- Decision: A) Keep root scope flexible, enforce strict rules only in `packages/*/src/services`
- Applied actions:
  - Migrated root non-service files out of `src/services`:
    - `themeContext.tsx` -> `src/theme/themeContext.tsx`
    - `services/theme/*` -> `src/theme/*`
    - `store.tsx` -> `src/stores/chatStore.ts`
    - `openChatNavigation.ts` -> `src/navigation/openChatNavigation.ts`
    - `services/llm/*` -> `src/llm/*`
    - Removed duplicate root `services/agentRegistry.ts` (no remaining runtime references)
  - Migrated package non-service registry out of service folder:
    - `packages/sdkwork-react-mobile-chat/src/services/agentRegistry.ts` -> `packages/sdkwork-react-mobile-chat/src/config/agentRegistry.ts`
  - Added validator phase warnings for new non-service files placed under `src/services`.
  - Current retained root service files:
    - `src/services/AppUiStateService.ts`

2. Encoding/mojibake check strategy (RESOLVED on 2026-03-03)
- Old broad mojibake regex caused high false-positive noise.
- Current status:
  - `pnpm validate:encoding` findings: `0`
- Active approach:
  - Keep low-noise `\uFFFD` rule in service validator.
  - Keep independent encoding validation:
    - `pnpm validate:encoding` (developer warning mode)
    - `pnpm validate:encoding:strict` (strict gate mode)
  - Add low-noise degraded-text heuristic:
    - detect suspicious long `?` clusters (`?{6,}`)
  - `pnpm validate:standards` now uses strict encoding gate by default.
- Alternative (not active):
  - Re-introduce dictionary-level mojibake matching (higher false-positive risk).

3. Command adapter default behavior (DEFAULTED in iterative mode, pending override)
- `runtimeDeps.command.execute` now returns a clear failure when no executor is configured.
- Active approach:
  - Keep fail-fast default (recommended for correctness).
- Alternative (not active):
  - Add mock fallback behavior for local dev only.

## 6. Iteration Checklist
1. Scan module service boundary and interaction entry points.
2. Refactor service implementation to runtime deps adapters.
3. Add/adjust service facade APIs for UI interaction.
4. Update validator rule for new mandatory constraints.
5. Run `pnpm validate:service-standard` and zero out errors/warnings.
6. Record unresolved standards and request confirmation.
