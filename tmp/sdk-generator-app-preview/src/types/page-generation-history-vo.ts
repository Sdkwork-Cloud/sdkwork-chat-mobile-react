import type { GenerationHistoryVO } from './generation-history-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageGenerationHistoryVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: GenerationHistoryVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
