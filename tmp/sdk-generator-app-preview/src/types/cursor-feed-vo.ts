import type { FeedItemVO } from './feed-item-vo';

export interface CursorFeedVO {
  records?: FeedItemVO[];
  nextCursor?: string;
}
