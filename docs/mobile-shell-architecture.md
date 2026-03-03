# Mobile Shell Architecture

This repository uses a shell-first mobile architecture: routing, tab navigation, and top-level UX standards are managed in `src/app/shell`, while business features stay in modular packages.

## Core Principles

1. Shell owns navigation semantics:
- Tab definitions and route-to-tab matching are centralized in `src/app/shell/navigation.ts`.
- Feature pages should not re-implement tab matching rules.

2. Packages own business capabilities:
- Domain logic lives in `packages/sdkwork-react-mobile-*`.
- Keep package pages decoupled from app-specific route details; inject callbacks from router when possible.

3. Shared UI contracts are explicit:
- `Navbar` is slot-based (`leftElement`, `centerElement`, `rightElement`) and backward compatible.
- Use shell components for global behaviors (safe area, sticky bars, overlays) to avoid duplicated UX drift.

## Extension Checklist

When adding a new top-level tab:
- Add config to `APP_TABS` in `src/app/shell/navigation.ts`.
- Add route matching rule in `TAB_ROUTE_RULES`.
- Ensure icon + label translation key exist.

When adding a deep feature page:
- Register route in `src/router/index.tsx`.
- Decide whether it maps to an existing tab via `resolveTabByPath`.
- Keep tabbar behavior stable (no local route hacks in page components).

## Stability Rules

- Any haptic/audio call must be non-blocking (`try/catch`) so navigation is never interrupted.
- Overlay masks must not block critical global controls (e.g., tabbar).
- Floating layers must reserve tabbar interaction area on mobile.
