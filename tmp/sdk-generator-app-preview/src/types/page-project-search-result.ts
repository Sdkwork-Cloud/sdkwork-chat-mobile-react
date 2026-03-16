import type { PageableObject } from './pageable-object';
import type { ProjectSearchResult } from './project-search-result';
import type { SortObject } from './sort-object';

export interface PageProjectSearchResult {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ProjectSearchResult[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
