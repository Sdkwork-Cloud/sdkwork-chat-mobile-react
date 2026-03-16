/** VIP购买请求 */
export interface VipPurchaseForm {
  /** 套餐ID */
  packId: number;
  /** 优惠券ID */
  couponId?: string;
  /** 支付方式 */
  paymentMethod?: string;
}
