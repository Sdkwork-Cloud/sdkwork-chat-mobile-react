import type { AssetVO } from './asset-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageAssetVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: AssetVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
