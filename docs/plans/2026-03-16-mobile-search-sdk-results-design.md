# Mobile Search SDK Results Design

> Scope: `packages/sdkwork-react-mobile-search` global result integration only.

## Goal

Upgrade the search module so that global search results use `@sdkwork/app-sdk` search APIs, while preserving the current page, store, and result group contracts.

## Approaches

### Option 1: Replace the full search pipeline with backend-only search

- Pros: simplest conceptual model.
- Cons: breaks local agent/chat result behavior and crosses into chat-specific search scope.

### Option 2: Hybrid search

- Pros: keeps local agent and chat search behavior intact, adds real backend results for files/articles/creations, minimal UI risk.
- Cons: mixed result sources require a small orchestration layer.

### Option 3: Keep history-only SDK integration

- Pros: no extra change.
- Cons: leaves the most important search results local-only and low fidelity.

## Recommended Design

Use Option 2.

`SearchSdkService` already owns search history. Extend it with global content search methods that map backend `notes`, `assets`, and `projects` into the existing `SearchResultItem` model. `SearchService` will keep:

- local `agents` results from `AGENT_REGISTRY`
- local `chats` results from chat session snapshots
- SDK-backed `others` results when no `contextSessionId` is provided

When a context chat id is provided, the service continues to use local chat-only search and does not call global SDK search.

## Mapping Rules

- `AssetSearchResult` -> `type: 'file'`
- `NoteSearchResult` -> `type: 'article'`
- `ProjectSearchResult` -> `type: 'creation'`
- remote result timestamps use current service clock because the search DTOs do not expose explicit timestamps

## Non-Goals

- No backend-driven chat message search
- No backend-driven agent search
- No UI contract changes
- No new result types

## Error Handling

- If remote global search fails, `SearchService` falls back to current local-only behavior.
- Search history remains SDK-first as already implemented.

## Testing

- Add `SearchSdkService` tests for mapping backend global search DTOs to `SearchResultItem`
- Add `SearchService` tests to verify SDK others override local snapshot-based others during global search
- Verify package build and workspace checks
