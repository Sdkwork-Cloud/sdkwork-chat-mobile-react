import type { GenerationStyleVO } from './generation-style-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageGenerationStyleVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: GenerationStyleVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
