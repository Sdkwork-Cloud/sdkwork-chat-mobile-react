# Auth User SDK Integration Design

**Scope:** `auth + user` only for `apps/sdkwork-chat-mobile-react`

**Out of Scope:** chat session, chat message, chat history, and any migration of existing chat services. Chat will use a dedicated SDK later.

## Context

The app already has:

- `@sdkwork/app-sdk` linked as a workspace dependency
- a shared SDK client entry at `packages/sdkwork-react-mobile-core/src/sdk/appSdkClient.ts`
- partial auth SDK integration in `packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts`
- modular pnpm workspace packages for auth, user, chat, and other domains

The current problem is not missing infrastructure. The problem is that auth and user flows are not yet treated as a stable, app-wide SDK-driven foundation. Session restore, current-user state, profile fetching, profile updates, and logout cleanup need one consistent architecture before other business modules are expanded.

## Goals

- Make `auth + user` fully SDK-driven through `@sdkwork/app-sdk`
- Centralize session restore, token persistence, token refresh, and logout cleanup
- Establish a single current-user source of truth for the application
- Keep UI code isolated from SDK DTOs through mappers and domain services
- Reserve a clean extension point for a future dedicated chat SDK

## Non-Goals

- No chat SDK migration
- No contacts, wallet, commerce, or VIP work in this phase
- No broad UI redesign
- No backend contract changes unless absolutely blocked by missing auth/user APIs

## Architecture

The first phase uses three layers:

### 1. SDK Core Layer

Location:

- `packages/sdkwork-react-mobile-core/src/sdk/`

Responsibilities:

- create and cache the `@sdkwork/app-sdk` client
- apply runtime base URL and timeout configuration
- inject auth token and access token
- expose session persistence helpers
- normalize SDK response envelopes and common SDK errors
- provide DTO-to-domain mapper helpers for auth and user

This layer must remain business-light. It should not know page concerns.

### 2. Domain Service Layer

Locations:

- `packages/sdkwork-react-mobile-auth/src/services/`
- `packages/sdkwork-react-mobile-user/src/services/`

Responsibilities:

- orchestrate SDK calls
- map DTOs into app-facing models
- implement session restore, login, refresh, logout, profile fetch, and profile update
- classify errors into app-meaningful categories

Pages must not call `@sdkwork/app-sdk` directly.

### 3. UI State Layer

Locations:

- auth store files in `packages/sdkwork-react-mobile-auth/src/`
- user store files in `packages/sdkwork-react-mobile-user/src/`

Responsibilities:

- hold session state, current-user state, loading flags, and recoverable errors
- expose selectors/actions to pages
- drive startup restore and screen refresh behavior

The stores should hold UI models, not raw SDK DTOs.

## Domain Model Boundaries

### Session Model

Required app-facing fields:

- authenticated flag
- auth token
- access token
- refresh token
- user id
- username
- display name

The auth service owns this model.

### Current User Model

Required app-facing fields:

- id
- username
- nickname/display name
- avatar URL
- email
- phone
- profile completeness fields needed by the current mobile UI

The user service owns mapping from SDK profile DTOs to this model.

## Data Flow

### App Startup

1. App boot triggers auth store initialization.
2. Auth store calls `restoreSession()`.
3. Core session helper reads persisted tokens from secure/local storage.
4. SDK client receives current token state.
5. If tokens exist, auth service attempts to resolve the current profile.
6. On success:
   - auth store becomes authenticated
   - user store receives `currentUser`
7. On failure:
   - invalid tokens are cleared
   - stores move to logged-out state

### Login

1. Login page submits credentials to auth store.
2. Auth store calls `appAuthService.login(...)`.
3. Service performs SDK login.
4. Service persists tokens.
5. Service resolves the current user profile.
6. Auth store and user store update together.

### Refresh Token

1. Auth service is the only layer allowed to refresh tokens.
2. On success, persisted tokens and client session are updated.
3. Existing `currentUser` state is preserved unless identity changes.
4. On failure, session is cleared and the app moves to logged-out state.

### User Profile Load

1. User page requests `userStore.ensureCurrentUser()`.
2. Store uses in-memory state first.
3. If missing or stale, user service requests profile via SDK.
4. DTO is mapped to user UI model.
5. Store updates current user state.

### User Profile Update

1. User page submits an app-facing update form.
2. User service converts it to SDK request DTO.
3. SDK updates the backend profile.
4. Response or follow-up read returns the latest profile.
5. Store replaces current user state.

### Logout

1. Auth service calls SDK logout when available.
2. Tokens are cleared even if remote logout fails.
3. Auth store resets session state.
4. User store clears `currentUser`.
5. Pure UI preferences remain untouched.

## Local vs Remote Responsibilities

Remote source of truth:

- login result
- refresh token result
- logout semantics
- current user profile
- profile updates

Local storage responsibilities:

- persisted auth token
- persisted access token
- persisted refresh token
- app boot recovery state

Local storage must not become a fake user-profile database. Profile data may be cached in memory, but remote user data is authoritative.

## Error Handling

Service layer errors should be classified into:

- `auth_expired`
- `network_error`
- `validation_error`
- `server_error`
- `unknown_error`

Expected handling:

- `auth_expired`
  - try refresh if appropriate
  - otherwise clear session and redirect to login
- `network_error`
  - keep current UI state
  - show retry affordance
- `validation_error`
  - attach field or form message for UI
- `server_error`
  - show generic failure message
- `unknown_error`
  - log for diagnostics and show safe fallback

Pages must not parse SDK envelope codes directly.

## Future Chat SDK Isolation

This phase must not route chat through `@sdkwork/app-sdk`.

To preserve future flexibility:

- app SDK code stays under `core/sdk/appSdkClient.ts` and auth/user helpers
- future chat SDK should live behind a separate entry such as:
  - `packages/sdkwork-react-mobile-core/src/sdk/chatSdkClient.ts`
  - `packages/sdkwork-react-mobile-chat/src/services/chatSdkAdapter.ts`

No new auth/user abstraction should assume chat shares the same SDK client or DTOs.

## Files Expected To Change

### Core

- `packages/sdkwork-react-mobile-core/src/sdk/appSdkClient.ts`
- new auth/user helper files under `packages/sdkwork-react-mobile-core/src/sdk/`

### Auth

- `packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts`
- auth store files under `packages/sdkwork-react-mobile-auth/src/`

### User

- user service files under `packages/sdkwork-react-mobile-user/src/services/`
- user store files under `packages/sdkwork-react-mobile-user/src/`

### App Initialization / Screens

- app bootstrap or root initialization files under `src/`
- login / register / profile / account UI screens that currently bypass store or SDK boundaries

## Verification Targets

The phase is considered complete when:

- login succeeds and produces stable authenticated state
- cold start restores session when tokens are valid
- invalid tokens are cleared on startup
- current user profile loads correctly
- profile update flows refresh UI state correctly
- logout clears both session and current-user state
- `pnpm run typecheck` passes
- `pnpm run build` passes
- targeted auth/user tests pass

## Risks

- current mobile pages may still be coupled to old local models and need mapper adaptation
- SDK DTO shape may not perfectly match current user UI shape
- if app SDK lacks one required user endpoint, backend and SDK regeneration may be needed before implementation can finish

