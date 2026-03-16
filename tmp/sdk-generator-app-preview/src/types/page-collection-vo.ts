import type { CollectionVO } from './collection-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageCollectionVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: CollectionVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
