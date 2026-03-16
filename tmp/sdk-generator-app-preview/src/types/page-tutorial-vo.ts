import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { TutorialVO } from './tutorial-vo';

export interface PageTutorialVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: TutorialVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
