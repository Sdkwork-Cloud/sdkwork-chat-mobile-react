# Chat Mobile React Architecture Map

## Stack

- React + TypeScript + Vite
- pnpm workspace with mobile feature packages
- Capacitor mobile host

## Standard Remote Path

Use this path for any business capability backed by `spring-ai-plus-app-api`:

`src shell / feature package / store -> packages/sdkwork-react-mobile-core/src/sdk/appSdkClient.ts -> @sdkwork/app-sdk -> spring-ai-plus-app-api`

The wrapper lives in `sdkwork-react-mobile-core`, not in each individual feature package.

## Local And Native Path

Keep these concerns on their original boundaries:

- Capacitor plugins and permission management
- secure storage, local preferences, and session persistence
- device, camera, geolocation, push notifications, and sharing
- local media preparation and native bridge orchestration

Local-only capability should stay local even while adjacent business modules move to the generated SDK.

## Replace Or Remove

- raw REST helpers in feature packages
- generic request helpers that bypass the shared wrapper
- duplicate DTO mapping that only exists to hide a missing SDK method
- manual auth header assignment in service layers

## Contract Closure Rule

If a feature package needs a method that the generated app SDK does not expose:

1. Fix the contract in `spring-ai-plus-app-api` and required backend modules.
2. Regenerate the shared app SDK from the repository-standard generator flow.
3. Reconnect the package through the shared wrapper.
4. Delete the temporary bypass.

If that backend work would touch schema, migration, or embedded DB layout, pause and ask the user first.
