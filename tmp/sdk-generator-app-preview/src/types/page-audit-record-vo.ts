import type { AuditRecordVO } from './audit-record-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageAuditRecordVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: AuditRecordVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
