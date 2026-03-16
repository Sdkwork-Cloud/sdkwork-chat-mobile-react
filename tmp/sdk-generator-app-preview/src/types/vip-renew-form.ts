/** VIP续费请求 */
export interface VipRenewForm {
  /** 续费天数 */
  duration?: number;
  /** 套餐ID */
  packId?: number;
  /** 优惠券ID */
  couponId?: string;
  /** 支付方式 */
  paymentMethod?: string;
}
