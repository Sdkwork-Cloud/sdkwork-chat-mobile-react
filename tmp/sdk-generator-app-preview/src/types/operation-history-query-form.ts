export interface OperationHistoryQueryForm {
  /** 操作类型 */
  action?: string;
  /** 操作结果 */
  result?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向: asc/desc */
  sortOrder?: string;
}
