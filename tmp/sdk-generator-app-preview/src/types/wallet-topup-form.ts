/** 钱包充值请求 */
export interface WalletTopupForm {
  /** 充值金额 */
  amount: number;
  /** 支付方式: ALIPAY/WECHAT/BANK/CARD */
  paymentMethod?: string;
  /** 幂等请求号(建议前端传UUID) */
  requestNo?: string;
  /** 备注 */
  remarks?: string;
}
