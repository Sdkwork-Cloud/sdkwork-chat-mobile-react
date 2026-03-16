import type { ActivityRecordVO } from './activity-record-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageActivityRecordVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ActivityRecordVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
