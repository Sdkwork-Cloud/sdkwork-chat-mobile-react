/** 中奖记录查询请求 */
export interface LotteryPrizeQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 领取状态: unclaimed/claimed */
  claimStatus?: string;
  size?: number;
  page?: number;
}
