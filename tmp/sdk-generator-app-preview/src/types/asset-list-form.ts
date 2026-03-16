/** 资产列表查询请求 */
export interface AssetListForm {
  /** 资产类型: IMAGE-图片, VIDEO-视频, AUDIO-音频, DOCUMENT-文档 */
  type?: string;
  /** 文件夹ID */
  folderId?: string;
  /** 关键词 */
  keyword?: string;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
}
