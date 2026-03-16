export interface NoteSearchRequest {
  /** 搜索关键词 */
  keyword?: string;
  /** 文件夹ID */
  folderId?: string;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
