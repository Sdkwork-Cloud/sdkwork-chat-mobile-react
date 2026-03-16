import type { PageableObject } from './pageable-object';
import type { SkuVO } from './sku-vo';
import type { SortObject } from './sort-object';

export interface PageSkuVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: SkuVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
