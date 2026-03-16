import type { ChatMessageVO } from './chat-message-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageChatMessageVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ChatMessageVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
