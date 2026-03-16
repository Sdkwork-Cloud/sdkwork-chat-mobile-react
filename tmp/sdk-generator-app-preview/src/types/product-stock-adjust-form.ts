export interface ProductStockAdjustForm {
  adjustType: 'INCREASE' | 'DECREASE' | 'CORRECTION';
  quantity: number;
  reason: string;
  operator?: string;
}
