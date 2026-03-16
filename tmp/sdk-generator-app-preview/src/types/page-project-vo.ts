import type { PageableObject } from './pageable-object';
import type { ProjectVO } from './project-vo';
import type { SortObject } from './sort-object';

export interface PageProjectVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ProjectVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
