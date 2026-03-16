/** 积分转账响应 */
export interface PointsTransferVO {
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
  /** 转账积分 */
  points?: number;
  /** 交易状态: SUCCESS-成功, FAILED-失败, PENDING-处理中 */
  status?: string;
  /** 转出账户剩余积分 */
  fromPointsAfter?: number;
  /** 转入账户剩余积分 */
  toPointsAfter?: number;
}
