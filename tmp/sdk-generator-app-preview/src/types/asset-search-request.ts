export interface AssetSearchRequest {
  /** 搜索关键词 */
  keyword?: string;
  /** 资源类型 */
  type?: string;
  /** 工作空间ID */
  workspaceId?: string;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
