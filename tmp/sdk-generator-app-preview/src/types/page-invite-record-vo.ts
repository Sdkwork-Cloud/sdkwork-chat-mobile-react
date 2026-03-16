import type { InviteRecordVO } from './invite-record-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageInviteRecordVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: InviteRecordVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
