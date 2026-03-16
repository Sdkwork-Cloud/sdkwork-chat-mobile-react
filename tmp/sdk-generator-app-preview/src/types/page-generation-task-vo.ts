import type { GenerationTaskVO } from './generation-task-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageGenerationTaskVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: GenerationTaskVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
