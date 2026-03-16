/** 现金充值请求 */
export interface CashRechargeForm {
  /** 充值金额 */
  amount: number;
  /** 支付方式: ALIPAY-支付宝, WECHAT-微信, BANK-银行卡 */
  paymentMethod?: string;
  /** 备注 */
  remarks?: string;
  /** 优惠券ID */
  couponId?: string;
}
