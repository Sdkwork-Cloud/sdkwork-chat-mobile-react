/** 钱包操作结果 */
export interface WalletOperationResultVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 请求号(用于轮询状态，通常等于transactionId) */
  requestNo?: string;
  /** 交易流水号 */
  transactionId?: string;
  /** 操作类型 */
  operationType?: string;
  /** 资产账户类型 */
  accountType?: string;
  /** 状态: SUCCESS/PROCESSING/FAILED */
  status?: string;
  /** 状态描述 */
  statusName?: string;
  /** 来源账户ID */
  fromAccountId?: string;
  /** 目标账户ID */
  toAccountId?: string;
  /** 现金金额 */
  amount?: number;
  /** 积分数量 */
  points?: number;
  /** Token数量 */
  tokens?: number;
  /** 来源账户可用现金余额(操作后) */
  fromBalanceAfter?: number;
  /** 目标账户可用现金余额(操作后) */
  toBalanceAfter?: number;
  /** 来源账户可用积分(操作后) */
  fromPointsAfter?: number;
  /** 目标账户可用积分(操作后) */
  toPointsAfter?: number;
  /** Token余额(操作后) */
  tokenAfter?: number;
  /** 冻结现金余额(操作后) */
  frozenBalance?: number;
  /** 支付方式/提现方式 */
  channel?: string;
  /** 结果描述 */
  resultDesc?: string;
  /** 处理时间 */
  processedAt?: string;
}
