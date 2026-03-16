import type { FileSystemNodeVO } from './file-system-node-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageFileSystemNodeVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: FileSystemNodeVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
