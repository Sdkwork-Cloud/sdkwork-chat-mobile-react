import type { PageableObject } from './pageable-object';
import type { PointsGoodsVO } from './points-goods-vo';
import type { SortObject } from './sort-object';

export interface PagePointsGoodsVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: PointsGoodsVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
