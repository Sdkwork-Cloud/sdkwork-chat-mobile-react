import type { PageableObject } from './pageable-object';
import type { PrivateMessageVO } from './private-message-vo';
import type { SortObject } from './sort-object';

export interface PagePrivateMessageVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: PrivateMessageVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
