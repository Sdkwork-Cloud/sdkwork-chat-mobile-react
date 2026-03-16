import type { ProductStockLogVO } from './product-stock-log-vo';

export interface ProductStockLogPageVO {
  content?: ProductStockLogVO[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
}
