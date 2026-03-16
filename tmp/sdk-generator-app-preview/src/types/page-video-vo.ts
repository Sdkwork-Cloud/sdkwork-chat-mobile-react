import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { VideoVO } from './video-vo';

export interface PageVideoVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: VideoVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
  records?: VideoVO[];
  total?: number;
}
