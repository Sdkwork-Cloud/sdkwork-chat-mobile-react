# GEMINI.md - OpenChat Mobile Project Context

## Project Overview
OpenChat Mobile is a modern, modular mobile application built with **React 19**, **Capacitor 6**, and **Vite**. It follows a **Shell-First Architecture** within a **pnpm monorepo** structure, designed for scalability and high performance on both web and native mobile platforms.

### Key Technologies
- **Framework:** React 19 (Functional Components, Hooks)
- **Native Bridge:** Capacitor 6
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand, Immer
- **Routing:** Custom centralized router with lazy loading
- **Internationalization:** i18next (via `react-i18next`)
- **AI Integration:** Google Generative AI (@google/genai)
- **Icons:** Lucide React

### Architecture: Shell-First & Modular
- **Shell (`src/app/shell`):** Manages the global UX, tab navigation, safe areas, and top-level routing semantics.
- **Modular Packages (`packages/`):** Business features are decoupled into standalone packages (e.g., `sdkwork-react-mobile-chat`, `sdkwork-react-mobile-auth`).
- **Platform Abstraction (`src/platform`):** Bridges web APIs and Capacitor native plugins to ensure cross-platform compatibility.

---

## Building and Running

### Prerequisites
- Node.js (>= 18.0.0)
- pnpm (>= 10.0.0)

### Key Commands
- **Install Dependencies:** `pnpm install`
- **Development Server:** `npm run dev` (Starts Vite on port 3000)
- **Build Application:** `npm run build`
- **Capacitor Sync:** `pnpm cap:sync`
- **Type Check:** `pnpm typecheck`
- **Linting:** `pnpm lint`
- **Testing:** `pnpm test`

### Mobile Development
- **iOS:** `npm run dev:ios`
- **Android:** `npm run dev:android`

---

## Development Conventions

### 1. Modular Feature Development
- Every new business module should be created as a package under `packages/sdkwork-react-mobile-*`.
- Each package must export its main pages and providers from its entry point (`src/index.ts`).
- Register the new package in the root `vite.config.ts` aliases for seamless module resolution during development.

### 2. Routing & Navigation
- Routes are centrally defined in `src/router/index.tsx`.
- Use `lazy()` for all page components to optimize bundle size and initial load time.
- Navigation should use the `navigate(path, params)` helper exported from `src/router/index.tsx`.
- Tab definitions and route-to-tab matching rules live in `src/app/shell/navigation.ts`.

### 3. Styling Standards
- Use **Tailwind CSS 4** for all styling.
- Follow the design tokens defined in `src/styles/` (CSS variables for themes).
- Ensure all UI components are responsive and respect mobile safe areas (using `env(safe-area-inset-*)`).

### 4. State & Data
- Use **Zustand** for local and global state.
- Use **Immer** for immutable state updates.
- Asynchronous side effects (API calls, haptics) should be handled within services or hooks, never directly in components if possible.

### 5. Platform Safety
- Always use the `Platform` abstraction (`src/platform/index.ts`) for native features.
- Wrap all native plugin calls (Haptics, Camera, Filesystem) in `try/catch` to prevent failures on web/unsupported environments.

### 6. Internationalization
- Use the `useTranslation` hook for all user-facing text.
- Translation keys follow the format: `namespace:key`.

---

## Workspace Structure
- `/packages/*`: Modular business features.
- `/src/app`: App entry and shell architecture.
- `/src/components`: Shared UI components (Atomic Design).
- `/src/platform`: Platform abstraction layer.
- `/src/router`: Routing configuration and navigation logic.
- `/src/services`: Shared singleton services (Theme, Auth, API).
- `/docs`: Architectural documentation and standards.
