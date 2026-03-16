import type { TradeTaskVO } from './trade-task-vo';

export interface TradeTaskPageVO {
  items?: TradeTaskVO[];
  total?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}
