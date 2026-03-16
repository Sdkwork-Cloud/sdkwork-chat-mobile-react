import type { DocumentVO } from './document-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageDocumentVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: DocumentVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
