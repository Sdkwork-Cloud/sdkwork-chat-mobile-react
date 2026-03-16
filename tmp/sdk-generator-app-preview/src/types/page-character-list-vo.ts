import type { CharacterListVO } from './character-list-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageCharacterListVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: CharacterListVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
