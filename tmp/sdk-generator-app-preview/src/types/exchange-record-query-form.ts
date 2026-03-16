/** 兑换记录查询请求 */
export interface ExchangeRecordQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 兑换状态: pending/shipped/completed/cancelled */
  status?: string;
  size?: number;
  page?: number;
}
