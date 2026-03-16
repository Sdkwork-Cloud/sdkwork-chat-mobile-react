import type { HistoryVO } from './history-vo';

/** 钱包操作状态 */
export interface WalletOperationStatusVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 请求号或交易号 */
  requestNo?: string;
  /** 是否查到记录 */
  found?: boolean;
  /** 是否已完成 */
  completed?: boolean;
  /** 聚合状态: PROCESSING/SUCCESS/FAILED */
  status?: string;
  /** 聚合状态描述 */
  statusName?: string;
  /** 主交易号 */
  transactionId?: string;
  /** 操作类型 */
  operationType?: string;
  /** 资产账户类型 */
  accountType?: string;
  /** 主记录时间 */
  processedAt?: string;
  /** 关联交易号列表 */
  relatedTransactionIds?: string[];
  /** 关联流水明细 */
  details?: HistoryVO[];
  /** 结果描述 */
  resultDesc?: string;
}
