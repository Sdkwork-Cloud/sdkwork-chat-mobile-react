import type { CurrencyVO } from './currency-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageCurrencyVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: CurrencyVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
