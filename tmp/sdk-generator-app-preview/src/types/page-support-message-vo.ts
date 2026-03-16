import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { SupportMessageVO } from './support-message-vo';

export interface PageSupportMessageVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: SupportMessageVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
