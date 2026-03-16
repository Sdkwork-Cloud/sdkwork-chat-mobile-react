/** 角色列表查询请求 */
export interface CharacterListQueryForm {
  /** 风格 */
  style?: string;
  /** 关键词 */
  keyword?: string;
  /** 页面 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方式 */
  sortOrder?: string;
}
