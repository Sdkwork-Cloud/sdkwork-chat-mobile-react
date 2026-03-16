export interface ProductStatusUpdateForm {
  status: 'ON_SHELF' | 'OFF_SHELF' | 'OUT_OF_STOCK' | 'DRAFT';
  reason?: string;
}
