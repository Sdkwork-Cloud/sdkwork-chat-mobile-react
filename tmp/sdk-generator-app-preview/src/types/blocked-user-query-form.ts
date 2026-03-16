/** 查询黑名单用户请求 */
export interface BlockedUserQueryForm {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 关键词 */
  keyword?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}
