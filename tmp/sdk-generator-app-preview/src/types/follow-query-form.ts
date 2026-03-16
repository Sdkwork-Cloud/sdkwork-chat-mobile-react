/** 查询关注列表请求 */
export interface FollowQueryForm {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 查询类型：followers/following */
  queryType?: string;
  /** 用户ID */
  userId?: string;
  /** 关键词 */
  keyword?: string;
}
