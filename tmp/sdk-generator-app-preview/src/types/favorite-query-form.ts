/** 查询收藏请求 */
export interface FavoriteQueryForm {
  /** 收藏类型 */
  favoriteType?: string;
  /** 类型（兼容字段） */
  type?: string;
  /** 文件夹ID */
  folderId?: string;
  /** 查询关键词 */
  keyword?: string;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
