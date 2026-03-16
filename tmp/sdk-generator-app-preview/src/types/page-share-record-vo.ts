import type { PageableObject } from './pageable-object';
import type { ShareRecordVO } from './share-record-vo';
import type { SortObject } from './sort-object';

export interface PageShareRecordVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ShareRecordVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
