import type { NoteVO } from './note-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageNoteVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: NoteVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
