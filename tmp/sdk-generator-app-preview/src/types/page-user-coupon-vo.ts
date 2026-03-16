import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { UserCouponVO } from './user-coupon-vo';

export interface PageUserCouponVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: UserCouponVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
