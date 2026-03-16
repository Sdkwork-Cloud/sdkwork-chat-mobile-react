export interface GlobalSearchRequest {
  /** 搜索关键词 */
  keyword?: string;
  /** 搜索类型 */
  type?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
