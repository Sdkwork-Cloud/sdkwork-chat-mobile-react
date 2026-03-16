import type { OperationHistoryVO } from './operation-history-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageOperationHistoryVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: OperationHistoryVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
