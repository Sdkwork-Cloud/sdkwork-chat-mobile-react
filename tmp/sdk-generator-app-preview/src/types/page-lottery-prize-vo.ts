import type { LotteryPrizeVO } from './lottery-prize-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageLotteryPrizeVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: LotteryPrizeVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
