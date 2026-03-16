import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { VoteDetailVO } from './vote-detail-vo';

export interface PageVoteDetailVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: VoteDetailVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
