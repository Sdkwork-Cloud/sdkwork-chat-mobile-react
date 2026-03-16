/** VIP升级请求 */
export interface VipUpgradeForm {
  /** 目标等级ID */
  targetLevelId: number;
  /** 优惠券ID */
  couponId?: string;
  /** 支付方式 */
  paymentMethod?: string;
}
