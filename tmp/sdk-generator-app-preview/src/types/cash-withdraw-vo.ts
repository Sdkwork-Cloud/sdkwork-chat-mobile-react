/** 现金提现响应 */
export interface CashWithdrawVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 交易流水号 */
  transactionId?: string;
  /** 账户ID */
  accountId?: string;
  /** 提现金额 */
  amount?: number;
  /** 提现后余额 */
  balanceAfter?: number;
  /** 冻结金额 */
  frozenBalance?: number;
  /** 交易状态: SUCCESS-成功, FAILED-失败, PENDING-处理中 */
  status?: string;
  /** 预计到账时间 */
  estimatedArrivalTime?: string;
  /** 提现方式 */
  withdrawMethod?: string;
}
