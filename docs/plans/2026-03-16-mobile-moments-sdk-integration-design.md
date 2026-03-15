# Mobile Moments SDK Integration Design

> Scope: `packages/sdkwork-react-mobile-moments` feed service integration only.

## Goal

Replace the local-only moments feed service with an SDK-first service that reads and mutates social feed data through `@sdkwork/app-sdk`, while keeping the current page, hook, store, and `Moment` type contracts unchanged.

## Approach Options

### Option 1: Full remote rewrite of page/store/service

- Pros: cleanest long-term architecture.
- Cons: too much surface area, unnecessary UI churn, higher regression risk.

### Option 2: SDK adapter plus service-layer orchestration

- Pros: matches the repo’s proven wallet and agents integration pattern, keeps contracts stable, isolates risk to `services/`.
- Cons: requires mapping remote DTOs into legacy local models and preserving some local state for comments/display.

### Option 3: Keep local service and add background SDK sync only

- Pros: lowest immediate risk.
- Cons: user actions remain mostly local, which misses the actual integration goal.

## Recommended Design

Use Option 2.

Add a `MomentsSdkService` that talks to `client.feed` and `client.comment`. `MomentsService` remains the module facade and becomes responsible for:

- loading remote feed data first;
- mapping remote feed items into `Moment`;
- syncing those mapped items into local storage for offline fallback;
- using remote publish/like/comment APIs when available;
- preserving local optimistic comments and timestamps when the backend feed list does not include full comment bodies.

## Data Flow

- `getFeed(page, size)`: prefer `feed.getFeedList`, map DTOs, persist the merged feed locally, then paginate from the synced list.
- `publish(content, images)`: prefer `feed.create`, map response into `Moment`, save to local storage, fallback to local creation when SDK is unavailable.
- `likeMoment(id)`: read current local state to determine like/unlike, call remote API if available, then persist local toggled state.
- `commentMoment(id, text)`: call remote `comment.createComment` if available, then append a local comment item so the existing UI still shows the new comment immediately.

## Mapping Rules

- `FeedItemVO.id` -> `Moment.id`
- `author.name` / `author.nickname` -> `Moment.author`
- `author.avatar` missing -> derive a Dicebear seed from author name
- `content` -> `Moment.content`
- `coverImage` + `images`-like fields -> `Moment.images`
- `likeCount` -> `Moment.likes`
- `isLiked` -> `Moment.hasLiked`
- `commentCount` is not enough to build actual comment rows, so initial remote comments map to `[]`

## Non-Goals

- No feed detail page.
- No share/collect wiring.
- No remote comment history rendering.
- No shell/store/UI redesign.

## Error Handling

- Read operations degrade to local data if remote fetch fails.
- Mutations use remote APIs when available, then keep local state aligned.
- If backend is not configured, the current local behavior remains intact.

## Testing

- Add `MomentsSdkService` tests for DTO mapping and remote mutation handling.
- Add `MomentsService` tests for SDK-first feed loading and local fallback.
- Verify package build and workspace standards after implementation.
