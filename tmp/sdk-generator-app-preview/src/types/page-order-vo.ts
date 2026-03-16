import type { OrderVO } from './order-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageOrderVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: OrderVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
