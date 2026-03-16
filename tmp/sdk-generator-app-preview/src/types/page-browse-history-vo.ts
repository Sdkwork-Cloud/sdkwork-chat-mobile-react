import type { BrowseHistoryVO } from './browse-history-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageBrowseHistoryVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: BrowseHistoryVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
