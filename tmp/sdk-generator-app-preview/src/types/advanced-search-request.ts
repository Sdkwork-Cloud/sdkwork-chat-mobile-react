export interface AdvancedSearchRequest {
  /** 搜索关键词 */
  keyword?: string;
  /** 搜索类型 */
  type?: string;
  /** 筛选条件 */
  filters?: Record<string, unknown>;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
