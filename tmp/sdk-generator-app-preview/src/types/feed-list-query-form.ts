/** Feed列表查询表单 */
export interface FeedListQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** Feed类型: recommend/following/hot */
  type?: string;
  /** 内容类型: all/image/video/audio/music */
  contentType?: string;
  /** 关键词 */
  keyword?: string;
  /** 作者ID */
  authorId?: number;
  size?: number;
  page?: number;
}
