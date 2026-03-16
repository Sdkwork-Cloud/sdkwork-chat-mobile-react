import type { PageableObject } from './pageable-object';
import type { SkillVO } from './skill-vo';
import type { SortObject } from './sort-object';

export interface PageSkillVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: SkillVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
  records?: SkillVO[];
  total?: number;
}
