import type { PageableObject } from './pageable-object';
import type { PaymentStatusVO } from './payment-status-vo';
import type { SortObject } from './sort-object';

export interface PagePaymentStatusVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: PaymentStatusVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
