import type { PageableObject } from './pageable-object';
import type { PromptHistoryVO } from './prompt-history-vo';
import type { SortObject } from './sort-object';

export interface PagePromptHistoryVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: PromptHistoryVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
