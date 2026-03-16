/** 用户活动查询请求 */
export interface UserActivityQueryForm {
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
  /** 活动类型 */
  activityType?: string;
  /** 用户ID */
  userId?: string;
  /** 每页大小 */
  pageSize?: number;
  /** 页码 */
  pageNum?: number;
}
