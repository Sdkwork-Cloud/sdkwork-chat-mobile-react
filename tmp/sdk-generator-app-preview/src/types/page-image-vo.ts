import type { ImageVO } from './image-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageImageVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ImageVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
