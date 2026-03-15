# Mobile Agents SDK Integration Design

> Scope: `packages/sdkwork-react-mobile-agents` non-chat metadata integration only.

## Goal

Make the agents module load agent cards and favorites from `@sdkwork/app-sdk` first while preserving the current local storage experience as an offline fallback.

## Approach Options

### Option 1: Replace the whole module with remote-only APIs

- Pros: smallest local code surface.
- Cons: breaks offline behavior, risks chat-adjacent regressions, overreaches beyond current scope.

### Option 2: SDK-first service layer with local fallback

- Pros: preserves current hooks/UI/store contracts, aligns with existing wallet/drive/notification integration pattern, isolates change to service methods.
- Cons: service logic becomes slightly more complex because it must merge remote and local state.

### Option 3: New parallel remote service consumed directly by hooks

- Pros: explicit separation between local and remote behavior.
- Cons: forces hook/page changes, duplicates orchestration logic, larger regression surface.

## Recommended Design

Use Option 2.

`AgentService` remains the public module service. It delegates agent metadata reads and favorite/default mutations to `AgentSdkService` when the SDK is configured and succeeds. It then syncs the returned agent metadata into local storage so the rest of the module keeps working unchanged. If SDK calls are unavailable or fail at transport level, the service falls back to current local storage data.

## Data Flow

- `getAgents`: fetch remote agent cards, decorate them with local favorite/default state, persist them, otherwise return stored agents.
- `getAgentById`: fetch remote detail, merge into stored agent list, otherwise read stored agent.
- `getDefaultAgent`: resolve the locally persisted default id through `getAgentById`.
- `setDefaultAgent`: persist local default state and fire SDK `use` signal opportunistically.
- `toggleFavorite`: call SDK like/unlike first when available, then persist local favorite state and emit existing event.
- `getFavoriteAgents`: prefer SDK liked list, sync to local, otherwise use stored favorite ids.

## Non-Goals

- No conversation transport changes.
- No template transport changes.
- No chat SDK integration.
- No hook or page contract changes unless verification exposes a hard break.

## Error Handling

- Remote business failure for favorite toggle should surface as an error because the user initiated a mutation.
- Remote list/detail fetch failures should degrade to local data instead of breaking the page.
- Storage writes continue to use the module's safe storage wrapper.

## Testing

- Add regression tests for `AgentService` SDK-first list loading and favorite mutation synchronization.
- Keep existing `AgentSdkService` mapping tests.
- Verify package build and workspace standards after implementation.
