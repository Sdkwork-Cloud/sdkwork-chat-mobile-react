export interface ProductStockAdjustVO {
  productId?: string;
  adjustType?: 'INCREASE' | 'DECREASE' | 'CORRECTION';
  quantity?: number;
  updatedStock?: number;
  reason?: string;
  operator?: string;
  updatedAt?: string;
}
