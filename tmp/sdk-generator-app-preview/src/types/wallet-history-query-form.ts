/** 钱包交易流水查询请求 */
export interface WalletHistoryQueryForm {
  /** 交易类型: RECHARGE(充值)/WITHDRAW(提现)/TRANSFER_IN(转入)/TRANSFER_OUT(转出)/EXCHANGE(兑换)/CONSUME(消费)/REWARD(奖励)/REFUND(退款)/ALL(全部) */
  transactionType?: string;
  /** 交易状态: SUCCESS(成功)/FAILED(失败)/PENDING(处理中)/CANCELLED(已取消) */
  status?: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 排序字段: createdAt(时间)/amount(金额) */
  sortField?: string;
  /** 排序方向: DESC(降序)/ASC(升序) */
  sortDirection?: string;
  /** 账户类型: CASH/POINTS/TOKEN */
  accountType: 'DEFAULT' | 'CASH' | 'POINTS' | 'TOKEN';
}
