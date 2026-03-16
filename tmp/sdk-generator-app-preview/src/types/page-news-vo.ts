import type { NewsVO } from './news-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageNewsVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: NewsVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
