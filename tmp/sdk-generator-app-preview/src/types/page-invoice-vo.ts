import type { InvoiceVO } from './invoice-vo';
import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';

export interface PageInvoiceVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: InvoiceVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
