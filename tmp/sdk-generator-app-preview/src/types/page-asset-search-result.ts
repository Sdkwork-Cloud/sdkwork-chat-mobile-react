import type { AssetSearchResult } from './asset-search-result';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageAssetSearchResult {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: AssetSearchResult[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
