export interface ProductStockLogVO {
  logId?: string;
  productId?: string;
  skuCode?: string;
  changeQuantity?: number;
  balanceQuantity?: number;
  adjustType?: 'INCREASE' | 'DECREASE' | 'CORRECTION';
  reason?: string;
  operator?: string;
  createdAt?: string;
}
