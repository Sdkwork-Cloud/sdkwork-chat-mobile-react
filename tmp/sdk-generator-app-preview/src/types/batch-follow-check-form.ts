/** 批量检查关注状态请求 */
export interface BatchFollowCheckForm {
  /** 用户ID列表 */
  userIds?: string[];
  /** 检查类型 */
  checkType?: string;
}
