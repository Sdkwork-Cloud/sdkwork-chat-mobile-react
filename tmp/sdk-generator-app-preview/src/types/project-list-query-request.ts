export interface ProjectListQueryRequest {
  /** 关键词 */
  keyword?: string;
  /** 工作空间ID */
  workspaceId?: string;
  /** 项目类型 */
  type?: string;
  /** 状态 */
  status?: string;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
