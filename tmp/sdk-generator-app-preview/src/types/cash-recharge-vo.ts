/** 现金充值响应 */
export interface CashRechargeVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 交易流水号 */
  transactionId?: string;
  /** 账户ID */
  accountId?: string;
  /** 充值金额 */
  amount?: number;
  /** 充值后余额 */
  balanceAfter?: number;
  /** 交易状态: SUCCESS-成功, FAILED-失败, PENDING-处理中 */
  status?: string;
  /** 支付方式 */
  paymentMethod?: string;
  /** 支付链接 */
  payUrl?: string;
}
