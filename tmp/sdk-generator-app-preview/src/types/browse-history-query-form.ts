export interface BrowseHistoryQueryForm {
  /** 浏览类型 */
  type?: string;
  /** 目标ID */
  targetId?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向: asc/desc */
  sortOrder?: string;
}
