import type { MusicVO } from './music-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageMusicVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: MusicVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
