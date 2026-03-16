import type { ModelInfoVO } from './model-info-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageModelInfoVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ModelInfoVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
