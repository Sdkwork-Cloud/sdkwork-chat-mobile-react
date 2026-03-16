import type { PageableObject } from './pageable-object';
import type { ProductVO } from './product-vo';
import type { SortObject } from './sort-object';

export interface PageProductVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ProductVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
