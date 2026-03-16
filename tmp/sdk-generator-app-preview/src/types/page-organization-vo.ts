import type { OrganizationVO } from './organization-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageOrganizationVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: OrganizationVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
