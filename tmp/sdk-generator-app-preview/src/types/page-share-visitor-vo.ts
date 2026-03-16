import type { PageableObject } from './pageable-object';
import type { ShareVisitorVO } from './share-visitor-vo';
import type { SortObject } from './sort-object';

export interface PageShareVisitorVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ShareVisitorVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
