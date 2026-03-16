import type { FollowUserVO } from './follow-user-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageFollowUserVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: FollowUserVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
