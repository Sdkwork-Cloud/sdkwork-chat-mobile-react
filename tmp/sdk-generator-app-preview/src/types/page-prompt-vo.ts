import type { PageableObject } from './pageable-object';
import type { PromptVO } from './prompt-vo';
import type { SortObject } from './sort-object';

export interface PagePromptVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: PromptVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
