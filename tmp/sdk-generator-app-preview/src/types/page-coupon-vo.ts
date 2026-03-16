import type { CouponVO } from './coupon-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageCouponVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: CouponVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
