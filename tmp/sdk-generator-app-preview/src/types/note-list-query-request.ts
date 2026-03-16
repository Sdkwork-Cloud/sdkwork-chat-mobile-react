/** 笔记列表查询请求 */
export interface NoteListQueryRequest {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序顺序 */
  sortOrder?: string;
  /** 文件夹ID */
  folderId?: string;
  /** 磁盘ID */
  diskId?: string;
  /** 关键词 */
  keyword?: string;
  /** 是否包含已归档笔记 */
  includeArchived?: boolean;
  /** 是否包含已删除笔记 */
  includeDeleted?: boolean;
  /** 是否仅返回收藏笔记 */
  favoriteOnly?: boolean;
}
