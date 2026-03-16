import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { UserSearchResult } from './user-search-result';

export interface PageUserSearchResult {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: UserSearchResult[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
