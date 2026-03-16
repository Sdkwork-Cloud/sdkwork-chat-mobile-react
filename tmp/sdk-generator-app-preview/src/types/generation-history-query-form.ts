/** 生成历史查询请求 */
export interface GenerationHistoryQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 生成类型 */
  generationType?: string;
  /** 状态 */
  status?: string;
  /** 关键词 */
  keyword?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  size?: number;
  page?: number;
}
