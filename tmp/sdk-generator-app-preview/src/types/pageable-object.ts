import type { SortObject } from './sort-object';

export interface PageableObject {
  offset?: number;
  paged?: boolean;
  sort?: SortObject;
  pageNumber?: number;
  pageSize?: number;
  unpaged?: boolean;
}
