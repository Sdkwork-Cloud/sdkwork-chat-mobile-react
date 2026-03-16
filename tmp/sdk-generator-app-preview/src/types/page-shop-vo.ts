import type { PageableObject } from './pageable-object';
import type { ShopVO } from './shop-vo';
import type { SortObject } from './sort-object';

export interface PageShopVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ShopVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
