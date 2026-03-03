# Upgrade Requirement - Auth Module v1.1.1

- Document time: 2026-03-03 23:59:00
- Business module: Auth
- Version: v1.1.1
- Repositories:
  - App integration side: `openchat-react-mobile`
  - SDK definition side: `sdkwork-sdk-app`

## 1. Background

`openchat-react-mobile` has completed real SDK integration for login, register, forgot-password request, verification, and reset.

Current integration blocker is not endpoint availability, but contract determinism:
1. Business errors are mostly free-form messages, which prevents stable client-side mapping.
2. Password-reset request does not provide explicit cooldown metadata.
3. Verification step does not return a reusable verification ticket for reset binding.

## 2. Current Issues

1. Error responses do not expose a stable business code namespace for auth.
2. `POST /auth/password/reset/request` lacks `cooldownSeconds` in response data.
3. `POST /auth/sms/verify` only indicates success/failure, no `verifyTicket` for the next step.
4. `POST /auth/password/reset` cannot bind to a prior verify proof other than raw code.

## 3. Upgrade Goals

1. Define deterministic auth business error semantics.
2. Add explicit password-reset cooldown metadata.
3. Add verification ticket flow to make reset operation safer and easier to validate.
4. Keep all changes additive and OpenAPI 3.x aligned.
5. Enforce success code standard: only `code = 2000` is considered success for auth APIs.

## 4. Proposed API Contract Upgrades

1. Unified auth business error extension (additive)
- Scope:
  - `POST /app/v3/api/auth/login`
  - `POST /app/v3/api/auth/register`
  - `POST /app/v3/api/auth/password/reset/request`
  - `POST /app/v3/api/auth/sms/verify`
  - `POST /app/v3/api/auth/password/reset`
- Proposal:
  - Keep current envelope fields (`code`, `msg`, `requestId`, `errorName`).
  - Add `bizCode` (optional string enum) for stable app logic.

2. Password reset request response enrichment
- Endpoint: `POST /app/v3/api/auth/password/reset/request`
- Add response `data` fields:
  - `challengeId`: string
  - `cooldownSeconds`: integer
  - `expireAt`: string(date-time)
  - `channel`: `EMAIL | SMS`
  - `targetMasked`: string

3. Verification result enrichment
- Endpoint: `POST /app/v3/api/auth/sms/verify`
- Add response `data` fields:
  - `verifyTicket`: string
  - `expiresAt`: string(date-time)

4. Reset password request enrichment
- Endpoint: `POST /app/v3/api/auth/password/reset`
- Add optional field in request body:
  - `verifyTicket`: string
- Validation rule:
  - If ticket is supplied, backend should validate ticket-code-account consistency.

## 5. Suggested `bizCode` Enum (Auth)

1. `AUTH_INVALID_CREDENTIALS`
2. `AUTH_ACCOUNT_NOT_FOUND`
3. `AUTH_ACCOUNT_ALREADY_EXISTS`
4. `AUTH_VERIFY_CODE_INVALID`
5. `AUTH_VERIFY_CODE_EXPIRED`
6. `AUTH_REQUEST_TOO_FREQUENT`
7. `AUTH_PASSWORD_POLICY_VIOLATION`
8. `AUTH_VERIFY_TICKET_INVALID`
9. `AUTH_VERIFY_TICKET_EXPIRED`
10. `AUTH_TOKEN_EXPIRED`

## 6. Delivery Requirements (for SDK Implementation Agent)

1. Update OpenAPI first, then regenerate SDK output.
2. Do not manually modify generated SDK artifacts.
3. Add integration tests for:
- login/register/reset error `bizCode` mapping consistency
- reset-request cooldown contract
- verify-ticket lifecycle (`request -> verify -> reset`)

## 7. Related OpenAPI Document

- `upgrade/upgrade-auth-module-v1.1.1-20260303-235900-openapi.yaml`
