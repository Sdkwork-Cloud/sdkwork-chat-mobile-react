import type { FeedbackVO } from './feedback-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageFeedbackVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: FeedbackVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
