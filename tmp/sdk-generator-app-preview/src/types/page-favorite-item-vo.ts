import type { FavoriteItemVO } from './favorite-item-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageFavoriteItemVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: FavoriteItemVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
