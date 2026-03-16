import type { NoteSearchResult } from './note-search-result';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageNoteSearchResult {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: NoteSearchResult[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
