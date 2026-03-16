import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageMapStringObject {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: Record<string, unknown>[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
