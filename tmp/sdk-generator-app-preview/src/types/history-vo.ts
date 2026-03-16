/** 账户历史记录响应 */
export interface HistoryVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 历史记录ID */
  historyId?: string;
  /** 账户ID */
  accountId?: string;
  /** 交易类型: RECHARGE-充值, WITHDRAW-提现, TRANSFER_IN-转入, TRANSFER_OUT-转出, CONSUME-消费, REFUND-退款, REWARD-奖励, EXCHANGE-兑换 */
  transactionType?: string;
  /** 交易类型名称 */
  transactionTypeName?: string;
  /** 交易金额(现金) */
  amount?: number;
  /** 交易积分 */
  points?: number;
  /** 交易Token */
  tokens?: number;
  /** 交易前余额 */
  balanceBefore?: number;
  /** 交易后余额 */
  balanceAfter?: number;
  /** 交易前积分 */
  pointsBefore?: number;
  /** 交易后积分 */
  pointsAfter?: number;
  /** 交易流水号 */
  transactionId?: string;
  /** 关联ID */
  relatedId?: string;
  /** 关联类型: ORDER-订单, TASK-任务, RECHARGE-充值, WITHDRAW-提现 */
  relatedType?: string;
  /** 备注 */
  remarks?: string;
  /** 交易状态: SUCCESS-成功, FAILED-失败, PENDING-处理中 */
  status?: string;
  /** 交易状态名称 */
  statusName?: string;
  /** 对方账户ID */
  counterpartyAccountId?: string;
  /** 对方用户ID */
  counterpartyUserId?: string;
  /** 对方用户名称 */
  counterpartyUserName?: string;
}
