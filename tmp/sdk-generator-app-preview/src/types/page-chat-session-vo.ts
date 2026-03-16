import type { ChatSessionVO } from './chat-session-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageChatSessionVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ChatSessionVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
