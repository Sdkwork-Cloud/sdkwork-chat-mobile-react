import type { LoginHistoryVO } from './login-history-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageLoginHistoryVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: LoginHistoryVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
