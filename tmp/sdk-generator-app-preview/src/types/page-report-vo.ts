import type { PageableObject } from './pageable-object';
import type { ReportVO } from './report-vo';
import type { SortObject } from './sort-object';

export interface PageReportVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ReportVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
