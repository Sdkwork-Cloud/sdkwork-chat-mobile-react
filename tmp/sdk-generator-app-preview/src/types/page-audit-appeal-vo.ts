import type { AuditAppealVO } from './audit-appeal-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageAuditAppealVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: AuditAppealVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
