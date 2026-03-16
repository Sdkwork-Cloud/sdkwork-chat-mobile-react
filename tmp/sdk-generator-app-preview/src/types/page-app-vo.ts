import type { AppVO } from './app-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageAppVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: AppVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
  records?: AppVO[];
  total?: number;
}
