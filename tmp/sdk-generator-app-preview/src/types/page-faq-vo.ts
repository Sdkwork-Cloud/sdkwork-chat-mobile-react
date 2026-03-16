import type { FaqVO } from './faq-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageFaqVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: FaqVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
