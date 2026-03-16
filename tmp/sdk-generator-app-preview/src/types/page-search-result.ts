import type { PageableObject } from './pageable-object';
import type { SearchResult } from './search-result';
import type { SortObject } from './sort-object';

export interface PageSearchResult {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: SearchResult[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
