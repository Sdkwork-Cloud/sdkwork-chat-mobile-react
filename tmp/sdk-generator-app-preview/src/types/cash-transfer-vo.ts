/** 现金转账响应 */
export interface CashTransferVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 交易流水号 */
  transactionId?: string;
  /** 转出账户ID */
  fromAccountId?: string;
  /** 转入账户ID */
  toAccountId?: string;
  /** 转账金额 */
  amount?: number;
  /** 交易状态: SUCCESS-成功, FAILED-失败, PENDING-处理中 */
  status?: string;
  /** 转出账户余额 */
  fromBalanceAfter?: number;
  /** 转入账户余额 */
  toBalanceAfter?: number;
}
