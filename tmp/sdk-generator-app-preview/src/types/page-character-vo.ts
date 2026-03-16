import type { CharacterVO } from './character-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageCharacterVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: CharacterVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
