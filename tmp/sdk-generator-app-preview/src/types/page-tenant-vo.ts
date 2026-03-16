import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { TenantVO } from './tenant-vo';

export interface PageTenantVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: TenantVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
