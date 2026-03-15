# Auth/User SDK Inventory Note

## Current Auth Entry Points

- `packages/sdkwork-react-mobile-auth/src/stores/authStore.ts`
  - Holds persisted auth UI state with `zustand/persist`
  - Current session bootstrap action is `checkSession()`
- `packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts`
  - Owns SDK login/register/logout/refresh/password reset/OAuth flows
- `packages/sdkwork-react-mobile-auth/src/services/useAppSdkClient.ts`
  - Browser-side token persistence and SDK session binding helpers
- `src/contexts/AuthContext.tsx`
  - Wraps `useAuthStore()` and exposes login/register/logout to the app shell
  - Current initialization is a `setTimeout`, not real session restore

## Current User Entry Points

- `packages/sdkwork-react-mobile-user/src/stores/userStore.ts`
  - Persists `profile` locally and orchestrates profile/address/invoice loading
- `packages/sdkwork-react-mobile-user/src/services/UserSdkService.ts`
  - Already consumes `@sdkwork/react-mobile-core` SDK client session helpers
- `packages/sdkwork-react-mobile-user/src/services/UserCenterService.ts`
  - Remote profile/address backend orchestration for current user features
- `packages/sdkwork-react-mobile-user/src/pages/ProfileInfoPage.tsx`
- `packages/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/pages/ProfileEditPage.tsx`
- `packages/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/pages/ProfileBindingEditPage.tsx`
- `packages/sdkwork-chat-mobile-react/packages/sdkwork-react-mobile-user/src/pages/MePage.tsx`

## App Bootstrap Entry Point

- `src/app/AppProvider.tsx`
  - Mounts `AuthProvider`
- `src/contexts/AuthContext.tsx`
  - Practical startup hook location for future `initializeAuth()` / `restoreSession()`
- `src/app/App.tsx`
  - Initializes platform/runtime layers only; no auth restore yet

## Pages / Consumers Likely To Migrate

- `src/router/index.tsx`
  - Route protection and auth redirects consume authenticated state indirectly
- `src/contexts/AuthContext.tsx`
  - Needs real restore flow instead of simulated loading
- User profile screens under `packages/sdkwork-react-mobile-user/src/pages/`
  - Should read current user state from the new auth/user store contract instead of relying on persisted local profile as authority

## Plan Review Notes

- The earlier assumption that `useAppSdkClient.ts` was missing was incorrect; the file exists under auth services.
- `react-mobile-core` currently exports only `appSdkClient.ts` under `src/sdk/`; explicit session helper and user mapper files still need to be introduced there.
- `react-mobile-auth/package.json` currently has no `test` or `test:run` scripts, so plan tasks 4 and 5 will need a small tooling adjustment before package-scoped test execution can match the written commands.
- Current auth startup does not restore the session. It only delays UI readiness by 500ms in `src/contexts/AuthContext.tsx`.
- Current user store persists the full `profile`, which conflicts with the new design goal that remote user data should be authoritative and local storage should be limited to session recovery data.
