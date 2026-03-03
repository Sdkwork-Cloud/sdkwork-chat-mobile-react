# Repository Guidelines

## Project Structure & Module Organization
This repository is a `pnpm` workspace for a React + Capacitor mobile app.
- `src/`: shell app, shared UI components, routing, platform adapters, and styles.
- `packages/sdkwork-react-mobile-*/src`: feature modules (auth, chat, contacts, wallet, etc.) plus shared packages like `core` and `commons`.
- `docs/`: architecture and routing documentation.
- `scripts/update-catalog-versions.mjs`: workspace dependency catalog maintenance.

Use package imports via aliases like `@sdkwork/react-mobile-chat` and root alias `@/*` defined in `tsconfig.json`.

## Build, Test, and Development Commands
- `pnpm install`: install all workspace dependencies.
- `pnpm dev`: run Vite in development mode for the root app.
- `pnpm build`: type-check (`tsc`) and create production build.
- `pnpm build:packages`: build all workspace packages.
- `pnpm typecheck`: run recursive TypeScript checks across packages.
- `pnpm lint` / `pnpm format:check`: run workspace lint/format checks.
- `pnpm test` / `pnpm test:run`: run package test scripts (currently concentrated in `@sdkwork/react-mobile-core`).
- `pnpm dev:ios` / `pnpm dev:android`: run Capacitor mobile workflows.

## Coding Style & Naming Conventions
- Language: TypeScript + React (ES modules).
- Indentation: 2 spaces; keep imports grouped and ordered consistently.
- Components: `PascalCase.tsx` (example: `ChatListItem.tsx`).
- Hooks: `useX.ts` (example: `useForm.ts`).
- Utilities/services/types: `camelCase.ts` or descriptive `PascalCase.ts` for class-based modules.
- Package naming: `sdkwork-react-mobile-<feature>`; keep feature boundaries clean.

## Testing Guidelines
- Frameworks: `vitest` with `@testing-library/react`.
- Place tests close to source using `*.test.ts` / `*.test.tsx`.
- For package-focused changes, run targeted tests first (example: `pnpm --filter @sdkwork/react-mobile-core test:run`), then run `pnpm test`.
- Validate behavior changes with at least one unit or integration test per bug fix/feature.

## Commit & Pull Request Guidelines
- Prefer Conventional Commit style with package scope, e.g. `feat(chat): add unread badge sync`.
- Keep commits focused; avoid mixing refactors and features.
- For release-impacting package changes, add a changeset (`pnpm changeset`).
- PRs should include: concise summary, affected packages, test evidence, linked issue, and screenshots/videos for UI changes.

## Security & Configuration Tips
- Keep secrets in `.env.local` (for example `GEMINI_API_KEY`); never commit API keys.
- Recheck `capacitor.config.ts` impacts when changing platform or build settings.
