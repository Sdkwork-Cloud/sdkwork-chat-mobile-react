# OpenChat QR HTTP Protocol

## Goals
- QR content must be a standard `http/https` URL.
- Camera scan should open a page directly.
- App should parse the URL payload and route to business logic (add friend, join group, open agent).

## Canonical Format
```
https://<host>/scan?qr=1&v=1&type=<user|group|agent>&id=<entityId>&name=<displayName>
```

## Required Fields
- `qr=1`: marks this as an OpenChat QR link.
- `v=1`: protocol version.
- `type`: one of `user`, `group`, `agent`.
- `id`: business entity id.

## Optional Fields
- `name`: display name for UI hint.

## Examples
- User:
  - `https://sdkwork.ai/scan?qr=1&v=1&type=user&id=u_1001&name=Alice`
- Group:
  - `https://sdkwork.ai/scan?qr=1&v=1&type=group&id=g_core&name=SDKWORK-Core`
- Agent:
  - `https://sdkwork.ai/scan?qr=1&v=1&type=agent&id=omni_core&name=Omni-Core`

## App Routing Behavior
- Open app with a QR URL:
  - `/scan?...` is opened directly.
  - `ScanPage` detects `initialScanResult` from query and dispatches `onScanResult`.
  - Router maps to target page:
    - `user` -> `/add-friend`
    - `agent` -> `/agents`
    - `group` -> `/join-group`

## Backward Compatibility
- Parser still supports legacy payloads:
  - `sdkwork://qr/entity?...`
  - JSON payload
  - token payload like `user:<id>:<name>`
- New generation path always uses HTTP protocol above.
