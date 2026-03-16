import type { PageableObject } from './pageable-object';
import type { PartnerVO } from './partner-vo';
import type { SortObject } from './sort-object';

export interface PagePartnerVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: PartnerVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
