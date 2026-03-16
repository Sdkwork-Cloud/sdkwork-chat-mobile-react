/** 活动查询请求 */
export interface ActivityQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 活动类型: lottery/check-in/points/exchange */
  type?: string;
  /** 活动状态: ongoing/upcoming/ended */
  status?: string;
  size?: number;
  page?: number;
}
