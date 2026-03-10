# Regional OAuth Login Design

## Context

The mobile app currently hardcodes third-party login buttons directly inside
`LoginPage` and only supports a narrow provider list in the auth service.
Provider differences are not modeled explicitly. This creates three concrete
problems:

1. Domestic and international app variants cannot express different login
   defaults cleanly.
2. OAuth platform differences such as popup, redirect, or native bridge flows
   are mixed into a single implementation path.
3. The app SDK already supports `QQ`, but the UI and service layer do not
   expose it.

The next iteration should establish a standard provider protocol that keeps the
UI declarative and moves provider-specific behavior into a small auth domain
layer.

## Goals

1. Support domestic and international login variants with stable defaults.
2. Normalize OAuth providers through a typed provider registry.
3. Handle provider-specific interaction modes:
   - `popup`
   - `redirect`
   - `native`
4. Add an OAuth callback surface so redirect-based providers can re-enter the
   app and complete business logic.
5. Keep the implementation compatible with the existing app SDK auth APIs.

## Non-Goals

1. Do not introduce remote-config-driven provider definitions yet.
2. Do not redesign registration or password reset flows in this iteration.
3. Do not add providers the current app SDK cannot submit.

## Provider Protocol

Each OAuth provider is represented by a typed descriptor:

- `id`: frontend provider id, e.g. `wechat`, `qq`, `google`
- `sdkProvider`: enum value accepted by the app SDK
- `market`: `cn`, `global`, or `shared`
- `priority`: ordering weight in the login UI
- `interactionMode`: preferred mode per runtime
- `scope`: optional OAuth scope hint
- `supports`: runtime capability flags for `web`, `native`, `ios`, `android`
- `requiresCallbackPage`: whether the provider can complete through a full-page
  redirect
- `title`, `subtitle`, `badge`, `iconKey`: presentational metadata

This protocol is consumed by both the UI layer and the auth service. The UI
uses it to render the provider deck. The auth service uses it to choose the
correct execution path.

## Market Resolution

Market resolution follows this order:

1. Explicit `market` prop passed to the login page
2. `VITE_AUTH_MARKET`
3. Browser/runtime language inference

Market values:

- `cn`: domestic variant
- `global`: international variant
- `auto`: infer from runtime

Inference rule:

- `zh-CN`, `zh`, or Simplified Chinese browser language resolves to `cn`
- everything else resolves to `global`

## Default Provider Sets

### Domestic

- WeChat
- QQ
- Apple
- GitHub

Rationale:
- WeChat and QQ are the primary consumer logins
- Apple remains important on iOS
- GitHub stays available as a fallback for developer-oriented users

### International

- Google
- Apple
- GitHub

Rationale:
- Google and Apple cover the mainstream mobile/web sign-in flows
- GitHub remains useful for technical users and low-friction testing

## Interaction Strategy

### Popup

Use popup for providers that work well in desktop web flows:

- Google
- GitHub

### Redirect

Use full-page redirect for providers that are more fragile in popup flows or
benefit from browser handoff:

- WeChat on web
- QQ on web

Redirect flow contract:

1. Request auth URL from backend SDK.
2. Navigate current window to provider auth URL.
3. Provider redirects back to `/auth/callback`.
4. Callback page reads `code`, `state`, `error`, and `provider`.
5. Callback page completes `oauthLogin`.
6. App stores session and redirects to the app root.

### Native

Use native mode when runtime is native and the provider supports native app
handoff:

- Apple on iOS native
- WeChat and QQ remain ready for native extension later, but this iteration
  keeps them on the app SDK OAuth URL flow until native plugin support exists.

If native execution is not implemented for a provider, fall back to redirect or
popup according to the provider descriptor.

## Callback Protocol

The app defines a stable callback contract at `/auth/callback`.

Accepted query params:

- `provider`
- `code`
- `state`
- `error`
- `error_description`

Behavior:

1. If `error` exists, show a failure state and route back to `/login`.
2. If `provider` or `code` is missing, show a protocol error.
3. If both exist, call the auth service to complete the OAuth login.
4. On success, redirect to `/`.

## Error Handling

Three classes of errors are surfaced explicitly:

1. Availability errors
   - provider unsupported for current market/runtime
2. Protocol errors
   - missing callback params
   - unsupported provider
3. Execution errors
   - popup blocked
   - timeout
   - provider cancelled
   - backend oauth login failed

The login page should show inline guidance rather than a generic failure toast
only.

## Testing Strategy

The implementation will be protected by tests for:

1. market resolution
2. provider availability and ordering
3. interaction mode selection
4. callback query validation
5. router coverage for the new callback route
6. locale coverage for the new auth copy

## Recommended Implementation Shape

Add a small auth domain layer inside `@sdkwork/react-mobile-auth`:

- `authMarket.ts`
- `oauthProviders.ts`
- `oauthFlow.ts`

Keep `LoginPage` declarative and data-driven. Keep `appAuthService` focused on
SDK calls and flow execution.
