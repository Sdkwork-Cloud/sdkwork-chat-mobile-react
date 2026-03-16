import type { PageableObject } from './pageable-object';
import type { PointsExchangeRecordVO } from './points-exchange-record-vo';
import type { SortObject } from './sort-object';

export interface PagePointsExchangeRecordVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: PointsExchangeRecordVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
