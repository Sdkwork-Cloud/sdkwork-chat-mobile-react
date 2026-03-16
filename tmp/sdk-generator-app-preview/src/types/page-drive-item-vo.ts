import type { DriveItemVO } from './drive-item-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageDriveItemVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: DriveItemVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
